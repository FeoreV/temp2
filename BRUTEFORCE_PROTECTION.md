# Защита от брутфорса

## Обзор

Система защиты от брутфорса включает в себя:

- 🛡️ Ограничение попыток входа по IP адресу
- 📊 Логирование всех попыток входа
- 🚫 Автоматическая блокировка подозрительных IP
- 📈 Мониторинг и статистика безопасности
- 🔧 Ручное управление блокировками

## Установка и настройка

### 1. Обновление базы данных

Выполните SQL-скрипт для создания таблиц безопасности:

```bash
mysql -u your_username -p your_database < bruteforce-schema.sql
```

### 2. Настройки защиты

Настройки защиты находятся в файле `middleware/bruteforce.js`:

```javascript
const BRUTEFORCE_CONFIG = {
  maxAttempts: 5,           // Максимальное количество попыток
  windowMs: 15 * 60 * 1000, // Окно времени (15 минут)
  blockDuration: 30 * 60 * 1000, // Время блокировки (30 минут)
  resetAttemptsAfter: 60 * 60 * 1000 // Сброс попыток через час
};
```

## Функциональность

### Автоматическая защита

1. **Отслеживание попыток входа**:
   - Каждая попытка входа логируется в базу данных
   - Ведется подсчет неудачных попыток по IP адресу
   - Учитывается временное окно для сброса счетчика

2. **Автоматическая блокировка**:
   - После 5 неудачных попыток IP блокируется на 30 минут
   - Блокировка сбрасывается автоматически по истечении времени
   - Успешный вход сбрасывает счетчик попыток

3. **Логирование**:
   - Все попытки входа сохраняются в таблице `login_attempts`
   - Записывается IP адрес, имя пользователя, результат, User Agent
   - Логи хранятся 30 дней с автоматической очисткой

### Мониторинг безопасности

Доступ к мониторингу: `http://localhost:3000/admin/security`

#### Статистика попыток входа
- Общее количество попыток за последние 7 дней
- Количество успешных и неудачных входов
- Процент успешных входов

#### Подозрительные IP адреса
- IP с большим количеством неудачных попыток
- IP с высоким процентом неудач (более 80%)
- Возможность ручной блокировки

#### Заблокированные IP адреса
- Список всех заблокированных IP
- Причина и время блокировки
- Возможность разблокировки

#### Последние попытки входа
- Детальная информация о попытках входа
- Время, IP, пользователь, результат
- User Agent браузера

## Структура базы данных

### Таблица `login_attempts`
```sql
CREATE TABLE login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  username VARCHAR(255),
  success TINYINT(1) NOT NULL DEFAULT 0,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `ip_blacklist`
```sql
CREATE TABLE ip_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  reason VARCHAR(255),
  blocked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `ip_whitelist`
```sql
CREATE TABLE ip_whitelist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Безопасность
- `GET /admin/security` - Страница мониторинга безопасности
- `POST /admin/security/block-ip` - Блокировка IP адреса
- `POST /admin/security/unblock-ip` - Разблокировка IP адреса

### Примеры использования API

#### Блокировка IP
```javascript
fetch('/admin/security/block-ip', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ip: '192.168.1.100' })
});
```

#### Разблокировка IP
```javascript
fetch('/admin/security/unblock-ip', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ip: '192.168.1.100' })
});
```

## Настройки безопасности

### Рекомендуемые настройки

```javascript
const BRUTEFORCE_CONFIG = {
  maxAttempts: 5,           // 5 попыток
  windowMs: 15 * 60 * 1000, // 15 минут
  blockDuration: 30 * 60 * 1000, // 30 минут блокировки
  resetAttemptsAfter: 60 * 60 * 1000 // Сброс через час
};
```

### Для продакшена

```javascript
const BRUTEFORCE_CONFIG = {
  maxAttempts: 3,           // Меньше попыток
  windowMs: 10 * 60 * 1000, // 10 минут
  blockDuration: 60 * 60 * 1000, // 1 час блокировки
  resetAttemptsAfter: 2 * 60 * 60 * 1000 // Сброс через 2 часа
};
```

## Мониторинг и уведомления

### Автоматические уведомления

Система может быть расширена для отправки уведомлений:

```javascript
// Пример интеграции с email уведомлениями
const sendSecurityAlert = (ip, attempts) => {
  // Отправка email администратору
  // Интеграция с Slack/Discord
  // SMS уведомления
};
```

### Интеграция с внешними системами

- **Fail2ban**: Экспорт заблокированных IP
- **Cloudflare**: Автоматическая блокировка
- **WAF**: Интеграция с Web Application Firewall
- **SIEM**: Отправка логов в систему мониторинга

## Лучшие практики

### 1. Регулярный мониторинг
- Проверяйте страницу безопасности ежедневно
- Анализируйте подозрительную активность
- Обновляйте белый список доверенных IP

### 2. Настройка уведомлений
- Настройте email уведомления о блокировках
- Используйте webhook для интеграции с внешними системами
- Настройте SMS уведомления для критических событий

### 3. Анализ логов
- Регулярно анализируйте логи попыток входа
- Ищите паттерны атак
- Обновляйте правила блокировки

### 4. Резервное копирование
- Регулярно создавайте резервные копии таблиц безопасности
- Экспортируйте настройки блокировок
- Документируйте изменения

## Устранение неполадок

### Проблема: IP заблокирован, но не должен быть

1. Проверьте таблицу `ip_blacklist`:
   ```sql
   SELECT * FROM ip_blacklist WHERE ip_address = 'YOUR_IP';
   ```

2. Разблокируйте IP через админ панель или SQL:
   ```sql
   DELETE FROM ip_blacklist WHERE ip_address = 'YOUR_IP';
   ```

### Проблема: Слишком много ложных срабатываний

1. Добавьте IP в белый список:
   ```sql
   INSERT INTO ip_whitelist (ip_address, description) 
   VALUES ('YOUR_IP', 'Доверенный IP');
   ```

2. Увеличьте лимит попыток в настройках

### Проблема: Не работает блокировка

1. Проверьте, что таблицы созданы:
   ```sql
   SHOW TABLES LIKE '%blacklist%';
   SHOW TABLES LIKE '%login%';
   ```

2. Проверьте логи сервера на ошибки
3. Убедитесь, что middleware подключен правильно

## Расширение функциональности

### Добавление геолокации

```javascript
const getIPLocation = async (ip) => {
  const response = await fetch(`https://ipapi.co/${ip}/json/`);
  return response.json();
};
```

### Интеграция с reCAPTCHA

```javascript
const verifyRecaptcha = async (token) => {
  // Проверка reCAPTCHA
  // Интеграция с Google reCAPTCHA
};
```

### Двухфакторная аутентификация

```javascript
const require2FA = (req, res, next) => {
  // Проверка 2FA
  // Интеграция с TOTP/HOTP
};
```

## Производительность

### Оптимизация для высоких нагрузок

1. **Использование Redis**:
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   ```

2. **Индексы базы данных**:
   ```sql
   CREATE INDEX idx_ip_time ON login_attempts(ip_address, created_at);
   CREATE INDEX idx_success_time ON login_attempts(success, created_at);
   ```

3. **Кэширование**:
   ```javascript
   const cache = new Map();
   // Кэширование результатов проверок
   ```

## Безопасность

### Дополнительные меры

1. **Rate Limiting**: Ограничение запросов по времени
2. **IP Geolocation**: Блокировка по географическому расположению
3. **Behavioral Analysis**: Анализ поведения пользователей
4. **Machine Learning**: Использование ML для выявления атак

### Аудит безопасности

Регулярно проводите аудит:
- Анализ логов безопасности
- Тестирование на проникновение
- Обновление правил блокировки
- Проверка эффективности защиты 