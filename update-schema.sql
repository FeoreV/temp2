-- Обновление схемы базы данных для добавления авторизации
-- Выполните этот скрипт в вашей базе данных MySQL

USE shop;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('admin', 'moderator') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Вставка администратора по умолчанию (пароль: admin123)
-- Пароль будет автоматически хеширован при первом запуске приложения
INSERT IGNORE INTO users (username, password, email, role) VALUES 
('admin', '$2b$10$default_hash_will_be_replaced', 'admin@example.com', 'admin');

-- Проверка создания таблицы
SELECT 'Таблица users создана успешно!' as status;
DESCRIBE users; 

-- Добавление таблицы для баннеров
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  button_text VARCHAR(100),
  button_url VARCHAR(255),
  image_url VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Добавление индекса для сортировки
CREATE INDEX idx_banners_sort_order ON banners(sort_order);
CREATE INDEX idx_banners_active ON banners(is_active); 