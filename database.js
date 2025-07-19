const mysql = require('mysql');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shop',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection
const connection = mysql.createConnection(dbConfig);

// Handle connection
connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    console.error('Проверьте настройки подключения в файле database.js');
    process.exit(1);
  }
  console.log('✅ Подключение к базе данных установлено (ID: ' + connection.threadId + ')');
});

// Handle connection errors
connection.on('error', (err) => {
  console.error('Ошибка базы данных:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Соединение с базой данных потеряно');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Слишком много соединений с базой данных');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Соединение с базой данных отклонено');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  connection.end((err) => {
    if (err) {
      console.error('Ошибка при закрытии соединения с БД:', err.message);
    } else {
      console.log('Соединение с базой данных закрыто');
    }
    process.exit(0);
  });
});

module.exports = connection;
