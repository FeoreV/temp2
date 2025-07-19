USE shop;

-- Добавление тестовых баннеров
INSERT INTO banners (title, subtitle, button_text, button_url, image_url, sort_order, is_active) VALUES
('Добро пожаловать в современный магазин!', 'Лучшие товары для профессионалов и любителей. Быстро. Качественно. Надёжно.', 'Перейти в каталог', '/catalog', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', 1, TRUE),
('Специальные предложения', 'Скидки до 50% на весь ассортимент. Ограниченное время!', 'Узнать больше', '/catalog?sale=true', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=400&fit=crop', 2, TRUE),
('Новинки сезона', 'Познакомьтесь с новыми поступлениями. Только качественные товары от проверенных производителей.', 'Смотреть новинки', '/catalog?new=true', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', 3, TRUE); 