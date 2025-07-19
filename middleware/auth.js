const bcrypt = require('bcrypt');
const db = require('../database');

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Пользователь авторизован
    next();
  } else {
    // Перенаправляем на страницу входа
    res.redirect('/admin/login');
  }
};

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).send('Доступ запрещен. Требуются права администратора.');
  }
};

// Функция для хеширования пароля
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Функция для проверки пароля
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Функция для создания первого администратора
const createDefaultAdmin = async () => {
  const defaultAdmin = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin'
  };

  try {
    // Проверяем, существует ли уже администратор
    db.query('SELECT id FROM users WHERE username = ?', [defaultAdmin.username], (err, results) => {
      if (err) {
        console.error('Ошибка при проверке существующего администратора:', err);
        return;
      }

      if (results.length === 0) {
        // Создаем хеш пароля
        hashPassword(defaultAdmin.password).then(hashedPassword => {
          const userData = {
            username: defaultAdmin.username,
            password: hashedPassword,
            email: defaultAdmin.email,
            role: defaultAdmin.role
          };

          db.query('INSERT INTO users SET ?', userData, (err) => {
            if (err) {
              console.error('Ошибка при создании администратора по умолчанию:', err);
            } else {
              console.log('✅ Администратор по умолчанию создан:');
              console.log(`   Логин: ${defaultAdmin.username}`);
              console.log(`   Пароль: ${defaultAdmin.password}`);
              console.log('⚠️  Рекомендуется изменить пароль после первого входа!');
            }
          });
        });
      }
    });
  } catch (error) {
    console.error('Ошибка при создании администратора по умолчанию:', error);
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  hashPassword,
  comparePassword,
  createDefaultAdmin
}; 