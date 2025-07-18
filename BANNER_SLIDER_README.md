# Слайдер баннеров

## Описание
Система слайдера баннеров позволяет администраторам управлять баннерами на главной странице сайта через админ панель. Баннеры автоматически сменяются каждые 10 секунд.

## Функциональность

### Для посетителей сайта:
- Автоматическое переключение баннеров каждые 10 секунд
- Ручное переключение с помощью стрелок навигации
- Переключение с помощью точек навигации
- Пауза при наведении мыши
- Поддержка клавиатурной навигации (стрелки влево/вправо)
- Поддержка свайпов на мобильных устройствах
- Адаптивный дизайн для всех устройств

### Для администраторов:
- Добавление новых баннеров
- Редактирование существующих баннеров
- Удаление баннеров
- Активация/деактивация баннеров
- Настройка порядка отображения
- Управление заголовком, подзаголовком, кнопкой и изображением

## Установка

1. Выполните SQL скрипт для создания таблицы баннеров:
```sql
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
```

2. Добавьте тестовые данные (опционально):
```sql
INSERT INTO banners (title, subtitle, button_text, button_url, image_url, sort_order, is_active) VALUES
('Добро пожаловать в современный магазин!', 'Лучшие товары для профессионалов и любителей. Быстро. Качественно. Надёжно.', 'Перейти в каталог', '/catalog', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', 1, TRUE),
('Специальные предложения', 'Скидки до 50% на весь ассортимент. Ограниченное время!', 'Узнать больше', '/catalog?sale=true', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=400&fit=crop', 2, TRUE),
('Новинки сезона', 'Познакомьтесь с новыми поступлениями. Только качественные товары от проверенных производителей.', 'Смотреть новинки', '/catalog?new=true', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', 3, TRUE);
```

## Использование

### Управление баннерами через админ панель:

1. Войдите в админ панель
2. Перейдите в раздел "🖼️ Баннеры"
3. Используйте кнопки для управления:
   - **Добавить баннер** - создание нового баннера
   - **Редактировать** - изменение существующего баннера
   - **Активировать/Деактивировать** - включение/отключение баннера
   - **Удалить** - удаление баннера

### Поля баннера:

- **Заголовок** (обязательное) - основной текст баннера
- **Подзаголовок** (необязательное) - дополнительный текст
- **Текст кнопки** (необязательное) - текст на кнопке
- **URL кнопки** (необязательное) - ссылка для кнопки
- **URL изображения** (обязательное) - ссылка на изображение баннера
- **Порядок сортировки** - порядок отображения (меньшие числа отображаются первыми)
- **Активен** - включение/отключение баннера

## Рекомендации по изображениям

- **Размер**: 1200x400 пикселей (рекомендуется)
- **Формат**: JPG, PNG, WebP
- **Вес**: не более 500KB для быстрой загрузки
- **Контент**: изображения должны быть качественными и соответствовать тематике баннера

## Технические детали

### Файлы системы:
- `routes/admin.js` - маршруты для управления баннерами
- `views/admin/banners.ejs` - страница списка баннеров
- `views/admin/banner-form.ejs` - форма добавления/редактирования
- `views/index.ejs` - главная страница со слайдером
- `public/css/style.css` - стили слайдера
- `public/js/banner-slider.js` - JavaScript для работы слайдера

### База данных:
- Таблица `banners` содержит все данные о баннерах
- Индексы оптимизированы для быстрого поиска активных баннеров
- Автоматическое обновление timestamp при изменении

### Производительность:
- Ленивая загрузка изображений
- Оптимизированные CSS анимации
- Эффективное управление памятью в JavaScript
- Адаптивные изображения для разных устройств

## Кастомизация

### Изменение времени переключения:
В файле `public/js/banner-slider.js` измените значение `slideDelay`:
```javascript
const slideDelay = 10000; // 10 секунд
```

### Изменение стилей:
Все стили слайдера находятся в `public/css/style.css` в секции "Слайдер баннеров".

### Добавление новых функций:
JavaScript код модульный и легко расширяемый. Основные функции:
- `showSlide(index)` - показать слайд по индексу
- `nextSlide()` - следующий слайд
- `prevSlide()` - предыдущий слайд
- `startAutoSlide()` - запустить автопереключение
- `stopAutoSlide()` - остановить автопереключение

## Поддержка браузеров

Слайдер поддерживает все современные браузеры:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Безопасность

- Все входные данные валидируются на сервере
- SQL-инъекции предотвращены через параметризованные запросы
- XSS-атаки предотвращены через экранирование данных в шаблонах
- Доступ к админ панели защищен аутентификацией 