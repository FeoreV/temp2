// Пример конфигурации для проекта
// Скопируйте этот файл как config.js и настройте под свои нужды

module.exports = {
  // Настройки базы данных
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop',
    charset: 'utf8mb4',
    timezone: '+00:00'
  },

  // Настройки сервера
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Настройки сессий
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
  },

  // Настройки загрузки файлов
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads/',
    maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv']
  }
}; 