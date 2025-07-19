# Инструкции по развертыванию

## Локальная разработка

### 1. Подготовка окружения
```bash
# Установка Node.js (если не установлен)
# Скачайте с https://nodejs.org/

# Установка MySQL (если не установлен)
# Скачайте с https://dev.mysql.com/downloads/mysql/
```

### 2. Настройка базы данных
```bash
# Подключитесь к MySQL
mysql -u root -p

# Создайте базу данных
CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Выйдите из MySQL
EXIT;

# Импортируйте схему
mysql -u root -p shop < schema.sql
```

### 3. Настройка проекта
```bash
# Установите зависимости
npm install

# Скопируйте конфигурацию
cp config.example.js config.js

# Отредактируйте config.js под ваши настройки
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```

## Продакшн развертывание

### 1. Подготовка сервера
```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите MySQL
sudo apt install mysql-server -y

# Установите PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Настройка базы данных
```bash
# Настройте безопасность MySQL
sudo mysql_secure_installation

# Создайте пользователя для приложения
sudo mysql
CREATE USER 'shop_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON shop.* TO 'shop_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Создайте базу данных и импортируйте схему
mysql -u shop_user -p shop < schema.sql
```

### 3. Настройка приложения
```bash
# Клонируйте репозиторий
git clone https://github.com/FeoreV/temp2.git
cd temp2

# Установите зависимости
npm install --production

# Создайте конфигурацию
cp config.example.js config.js
nano config.js
```

### 4. Настройка переменных окружения
```bash
# Создайте файл .env
cat > .env << EOF
DB_HOST=localhost
DB_USER=shop_user
DB_PASSWORD=your_secure_password
DB_NAME=shop
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-very-secure-secret-key
EOF
```

### 5. Настройка Nginx (опционально)
```bash
# Установите Nginx
sudo apt install nginx -y

# Создайте конфигурацию
sudo nano /etc/nginx/sites-available/shop

# Добавьте конфигурацию:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активируйте сайт
sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Запуск с PM2
```bash
# Создайте файл ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'shop',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Создайте папку для логов
mkdir logs

# Запустите приложение
pm2 start ecosystem.config.js

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск
pm2 startup
```

### 7. Настройка SSL (опционально)
```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com

# Настройте автоматическое обновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Мониторинг и обслуживание

### Просмотр логов
```bash
# Логи PM2
pm2 logs shop

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Обновление приложения
```bash
# Остановите приложение
pm2 stop shop

# Обновите код
git pull origin main

# Установите новые зависимости
npm install --production

# Перезапустите приложение
pm2 restart shop
```

### Резервное копирование базы данных
```bash
# Создайте скрипт для бэкапа
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mysqldump -u shop_user -p shop > backup_\$DATE.sql
gzip backup_\$DATE.sql
EOF

chmod +x backup.sh

# Добавьте в cron для автоматического бэкапа
crontab -e
# Добавьте строку (бэкап каждый день в 2:00):
0 2 * * * /path/to/your/project/backup.sh
```

## Устранение неполадок

### Проблемы с подключением к БД
```bash
# Проверьте статус MySQL
sudo systemctl status mysql

# Проверьте подключение
mysql -u shop_user -p -e "SELECT 1;"
```

### Проблемы с портами
```bash
# Проверьте, что порт 3000 свободен
sudo netstat -tlnp | grep :3000

# Убейте процесс, если нужно
sudo kill -9 <PID>
```

### Проблемы с правами доступа
```bash
# Установите правильные права
sudo chown -R $USER:$USER /path/to/your/project
chmod -R 755 /path/to/your/project
chmod 600 .env
``` 