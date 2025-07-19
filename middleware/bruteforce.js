const db = require('../database');

// Хранилище попыток входа (в продакшене лучше использовать Redis)
const loginAttempts = new Map();

// Настройки защиты от брутфорса
const BRUTEFORCE_CONFIG = {
  maxAttempts: 5,           // Максимальное количество попыток
  windowMs: 15 * 60 * 1000, // Окно времени (15 минут)
  blockDuration: 30 * 60 * 1000, // Время блокировки (30 минут)
  resetAttemptsAfter: 60 * 60 * 1000 // Сброс попыток через час
};

// Получение IP адреса клиента
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
};

// Получение информации о попытках входа
const getLoginAttempts = (ip) => {
  const attempts = loginAttempts.get(ip);
  if (!attempts) {
    return { count: 0, firstAttempt: null, lastAttempt: null, blockedUntil: null };
  }
  return attempts;
};

// Обновление информации о попытках входа
const updateLoginAttempts = (ip, success = false) => {
  const now = Date.now();
  const attempts = getLoginAttempts(ip);
  
  if (success) {
    // Успешный вход - сбрасываем счетчик
    loginAttempts.delete(ip);
    return;
  }
  
  // Неудачная попытка
  if (attempts.count === 0) {
    // Первая попытка
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blockedUntil: null
    });
  } else {
    // Последующие попытки
    attempts.count++;
    attempts.lastAttempt = now;
    
    // Проверяем, нужно ли заблокировать
    if (attempts.count >= BRUTEFORCE_CONFIG.maxAttempts) {
      attempts.blockedUntil = now + BRUTEFORCE_CONFIG.blockDuration;
    }
    
    loginAttempts.set(ip, attempts);
  }
};

// Проверка, заблокирован ли IP
const isIPBlocked = (ip) => {
  const attempts = getLoginAttempts(ip);
  if (!attempts.blockedUntil) {
    return false;
  }
  
  const now = Date.now();
  if (now < attempts.blockedUntil) {
    return true;
  }
  
  // Время блокировки истекло - сбрасываем
  loginAttempts.delete(ip);
  return false;
};

// Очистка старых записей
const cleanupOldAttempts = () => {
  const now = Date.now();
  for (const [ip, attempts] of loginAttempts.entries()) {
    // Удаляем записи старше часа
    if (now - attempts.lastAttempt > BRUTEFORCE_CONFIG.resetAttemptsAfter) {
      loginAttempts.delete(ip);
    }
  }
};

// Middleware для защиты от брутфорса
const bruteforceProtection = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  // Очищаем старые записи
  cleanupOldAttempts();
  
  // Проверяем, заблокирован ли IP в базе данных
  db.query('SELECT * FROM ip_blacklist WHERE ip_address = ? AND (blocked_until IS NULL OR blocked_until > NOW())', [clientIP], (err, results) => {
    if (err) {
      console.error('Ошибка при проверке блокировки IP:', err);
      return next();
    }
    
    if (results.length > 0) {
      const block = results[0];
      const reason = block.reason || 'IP заблокирован';
      
      return res.render('admin/login', {
        error: `${reason}. Обратитесь к администратору.`,
        success: null
      });
    }
    
    // Проверяем локальную блокировку от брутфорса
    if (isIPBlocked(clientIP)) {
      const attempts = getLoginAttempts(clientIP);
      const remainingTime = Math.ceil((attempts.blockedUntil - Date.now()) / 1000 / 60);
      
      return res.render('admin/login', {
        error: `Слишком много неудачных попыток входа. Попробуйте снова через ${remainingTime} минут.`,
        success: null
      });
    }
    
    // Добавляем информацию о попытках в req для использования в маршрутах
    req.bruteforce = {
      clientIP,
      getLoginAttempts: () => getLoginAttempts(clientIP),
      updateLoginAttempts: (success) => updateLoginAttempts(clientIP, success),
      isBlocked: () => isIPBlocked(clientIP)
    };
    
    next();
  });
};

// Middleware для логирования попыток входа в базу данных
const logLoginAttempt = (req, success, username = null) => {
  const clientIP = getClientIP(req);
  const userAgent = req.get('User-Agent') || 'Unknown';
  const timestamp = new Date();
  
  const logData = {
    ip_address: clientIP,
    username: username,
    success: success ? 1 : 0,
    user_agent: userAgent,
    created_at: timestamp
  };
  
  // Логируем попытку входа в базу данных
  db.query('INSERT INTO login_attempts SET ?', logData, (err) => {
    if (err) {
      console.error('Ошибка при логировании попытки входа:', err);
    }
  });
};

// Функция для получения статистики попыток входа
const getLoginStats = (callback) => {
  const sql = `
    SELECT 
      COUNT(*) as total_attempts,
      SUM(success) as successful_attempts,
      COUNT(*) - SUM(success) as failed_attempts,
      DATE(created_at) as date
    FROM login_attempts 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  
  db.query(sql, callback);
};

// Функция для очистки старых логов
const cleanupOldLogs = () => {
  const sql = 'DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)';
  db.query(sql, (err) => {
    if (err) {
      console.error('Ошибка при очистке старых логов:', err);
    } else {
      console.log('Старые логи попыток входа очищены');
    }
  });
};

// Запускаем очистку старых логов каждый день
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

module.exports = {
  bruteforceProtection,
  logLoginAttempt,
  getLoginStats,
  BRUTEFORCE_CONFIG
}; 