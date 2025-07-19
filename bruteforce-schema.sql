-- Схема для защиты от брутфорса
-- Выполните этот скрипт в вашей базе данных MySQL

USE shop;

-- Таблица для логирования попыток входа
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  username VARCHAR(255),
  success TINYINT(1) NOT NULL DEFAULT 0,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_address (ip_address),
  INDEX idx_username (username),
  INDEX idx_success (success),
  INDEX idx_created_at (created_at)
);

-- Таблица для блокировки IP адресов
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason VARCHAR(255),
  blocked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_address (ip_address),
  INDEX idx_blocked_until (blocked_until)
);

-- Таблица для белого списка IP (доверенные адреса)
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_address (ip_address)
);

-- Создание представления для статистики попыток входа
CREATE OR REPLACE VIEW login_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_attempts,
  SUM(success) as successful_attempts,
  COUNT(*) - SUM(success) as failed_attempts,
  ROUND((SUM(success) / COUNT(*)) * 100, 2) as success_rate
FROM login_attempts 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Создание представления для подозрительных IP
CREATE OR REPLACE VIEW suspicious_ips AS
SELECT 
  ip_address,
  COUNT(*) as total_attempts,
  SUM(success) as successful_attempts,
  COUNT(*) - SUM(success) as failed_attempts,
  MAX(created_at) as last_attempt,
  ROUND((COUNT(*) - SUM(success)) / COUNT(*) * 100, 2) as failure_rate
FROM login_attempts 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY ip_address
HAVING failed_attempts >= 5 OR failure_rate >= 80
ORDER BY failed_attempts DESC, failure_rate DESC;

-- Процедура для очистки старых логов
DELIMITER //
CREATE PROCEDURE CleanupOldLoginLogs(IN days_to_keep INT)
BEGIN
  DELETE FROM login_attempts 
  WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
  
  SELECT ROW_COUNT() as deleted_records;
END //
DELIMITER ;

-- Процедура для блокировки IP
DELIMITER //
CREATE PROCEDURE BlockIP(IN ip_addr VARCHAR(45), IN block_reason VARCHAR(255), IN block_hours INT)
BEGIN
  INSERT INTO ip_blacklist (ip_address, reason, blocked_until) 
  VALUES (ip_addr, block_reason, DATE_ADD(NOW(), INTERVAL block_hours HOUR))
  ON DUPLICATE KEY UPDATE 
    reason = block_reason,
    blocked_until = DATE_ADD(NOW(), INTERVAL block_hours HOUR);
    
  SELECT 'IP заблокирован' as result;
END //
DELIMITER ;

-- Процедура для разблокировки IP
DELIMITER //
CREATE PROCEDURE UnblockIP(IN ip_addr VARCHAR(45))
BEGIN
  DELETE FROM ip_blacklist WHERE ip_address = ip_addr;
  SELECT 'IP разблокирован' as result;
END //
DELIMITER ;

-- Триггер для автоматической очистки истекших блокировок
DELIMITER //
CREATE TRIGGER cleanup_expired_blocks
BEFORE INSERT ON ip_blacklist
FOR EACH ROW
BEGIN
  DELETE FROM ip_blacklist 
  WHERE blocked_until IS NOT NULL 
    AND blocked_until < NOW();
END //
DELIMITER ;

-- Проверка создания таблиц
SELECT 'Таблицы для защиты от брутфорса созданы успешно!' as status;
SHOW TABLES LIKE '%login%';
SHOW TABLES LIKE '%blacklist%'; 