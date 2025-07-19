const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');
const { hashPassword, comparePassword } = require('../middleware/auth');
const { bruteforceProtection, logLoginAttempt } = require('../middleware/bruteforce');

// Страница входа
router.get('/login', (req, res) => {
  // Если пользователь уже авторизован, перенаправляем в админ панель
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  
  res.render('admin/login', { 
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Обработка входа с защитой от брутфорса
router.post('/login', bruteforceProtection, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // Логируем неудачную попытку входа
    logLoginAttempt(req, false, username);
    req.bruteforce.updateLoginAttempts(false);
    
    return res.render('admin/login', { 
      error: 'Пожалуйста, заполните все поля',
      success: null
    });
  }

  // Ищем пользователя в базе данных
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, users) => {
    if (err) {
      console.error('Ошибка при поиске пользователя:', err);
      logLoginAttempt(req, false, username);
      req.bruteforce.updateLoginAttempts(false);
      
      return res.render('admin/login', { 
        error: 'Произошла ошибка на сервере',
        success: null
      });
    }

    if (users.length === 0) {
      // Логируем неудачную попытку входа
      logLoginAttempt(req, false, username);
      req.bruteforce.updateLoginAttempts(false);
      
      return res.render('admin/login', { 
        error: 'Неверное имя пользователя или пароль',
        success: null
      });
    }

    const user = users[0];

    // Проверяем пароль
    try {
      const isValidPassword = await comparePassword(password, user.password);
      
      if (!isValidPassword) {
        // Логируем неудачную попытку входа
        logLoginAttempt(req, false, username);
        req.bruteforce.updateLoginAttempts(false);
        
        return res.render('admin/login', { 
          error: 'Неверное имя пользователя или пароль',
          success: null
        });
      }

      // Логируем успешную попытку входа
      logLoginAttempt(req, true, username);
      req.bruteforce.updateLoginAttempts(true);

      // Сохраняем данные пользователя в сессии
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.email = user.email;

      // Перенаправляем в админ панель
      res.redirect('/admin');
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      logLoginAttempt(req, false, username);
      req.bruteforce.updateLoginAttempts(false);
      
      res.render('admin/login', { 
        error: 'Произошла ошибка при проверке пароля',
        success: null
      });
    }
  });
});

// Выход из системы
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе из системы:', err);
    }
    res.redirect('/admin/login?success=Вы успешно вышли из системы');
  });
});

// Страница регистрации (только для первого пользователя)
router.get('/register', (req, res) => {
  // Проверяем, есть ли уже пользователи в системе
  db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
    if (err) {
      console.error('Ошибка при проверке пользователей:', err);
      return res.status(500).send('Произошла ошибка на сервере');
    }

    if (results[0].count > 0) {
      return res.status(403).send('Регистрация закрыта. Обратитесь к администратору.');
    }

    res.render('admin/register', { 
      error: req.query.error 
    });
  });
});

// Обработка регистрации
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  // Проверяем, есть ли уже пользователи в системе
  db.query('SELECT COUNT(*) as count FROM users', async (err, results) => {
    if (err) {
      console.error('Ошибка при проверке пользователей:', err);
      return res.render('admin/register', { 
        error: 'Произошла ошибка на сервере' 
      });
    }

    if (results[0].count > 0) {
      return res.status(403).send('Регистрация закрыта. Обратитесь к администратору.');
    }

    // Валидация данных
    if (!username || !password || !confirmPassword || !email) {
      return res.render('admin/register', { 
        error: 'Пожалуйста, заполните все поля' 
      });
    }

    if (password !== confirmPassword) {
      return res.render('admin/register', { 
        error: 'Пароли не совпадают' 
      });
    }

    if (password.length < 6) {
      return res.render('admin/register', { 
        error: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    try {
      // Хешируем пароль
      const hashedPassword = await hashPassword(password);

      // Создаем пользователя
      const userData = {
        username,
        password: hashedPassword,
        email,
        role: 'admin' // Первый пользователь всегда администратор
      };

      db.query('INSERT INTO users SET ?', userData, (err) => {
        if (err) {
          console.error('Ошибка при создании пользователя:', err);
          return res.render('admin/register', { 
            error: 'Ошибка при создании пользователя. Возможно, такой пользователь уже существует.' 
          });
        }

        res.redirect('/admin/login?success=Пользователь успешно создан. Теперь вы можете войти в систему.');
      });
    } catch (error) {
      console.error('Ошибка при хешировании пароля:', error);
      res.render('admin/register', { 
        error: 'Произошла ошибка при создании пользователя' 
      });
    }
  });
});

// Страница смены пароля
router.get('/change-password', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/admin/login');
  }

  res.render('admin/change-password', { 
    error: req.query.error,
    success: req.query.success 
  });
});

// Обработка смены пароля
router.post('/change-password', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/admin/login');
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('admin/change-password', { 
      error: 'Пожалуйста, заполните все поля' 
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('admin/change-password', { 
      error: 'Новые пароли не совпадают' 
    });
  }

  if (newPassword.length < 6) {
    return res.render('admin/change-password', { 
      error: 'Новый пароль должен содержать минимум 6 символов' 
    });
  }

  // Получаем текущий пароль пользователя
  db.query('SELECT password FROM users WHERE id = ?', [req.session.userId], async (err, users) => {
    if (err || users.length === 0) {
      return res.render('admin/change-password', { 
        error: 'Произошла ошибка на сервере' 
      });
    }

    const user = users[0];

    try {
      // Проверяем текущий пароль
      const isValidPassword = await comparePassword(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.render('admin/change-password', { 
          error: 'Неверный текущий пароль' 
        });
      }

      // Хешируем новый пароль
      const hashedNewPassword = await hashPassword(newPassword);

      // Обновляем пароль в базе данных
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.session.userId], (err) => {
        if (err) {
          console.error('Ошибка при обновлении пароля:', err);
          return res.render('admin/change-password', { 
            error: 'Произошла ошибка при обновлении пароля' 
          });
        }

        res.redirect('/admin/change-password?success=Пароль успешно изменен');
      });
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      res.render('admin/change-password', { 
        error: 'Произошла ошибка при проверке пароля' 
      });
    }
  });
});

module.exports = router; 