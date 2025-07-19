const express = require('express');
const session = require('express-session');
const path = require('path');

// Import routes
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const { createDefaultAdmin } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static('public'));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', shopRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

// Start server
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Админ панель: http://localhost:${port}/admin`);
  
  // Создаем администратора по умолчанию при первом запуске
  createDefaultAdmin();
});

