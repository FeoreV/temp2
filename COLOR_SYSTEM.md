# Система управления цветами

## Обзор

Новая система управления цветами основана на CSS переменных в `:root` и предоставляет удобный способ управления цветовой схемой всего приложения.

## Структура переменных

### Основные цвета (RGB значения)
```css
--color-primary: 35, 120, 200;      /* Основной синий */
--color-secondary: 30, 40, 50;      /* Темно-серый */
--color-accent: 144, 202, 249;      /* Светло-синий */
--color-success: 40, 167, 69;       /* Зеленый */
--color-warning: 255, 193, 7;       /* Желтый */
--color-danger: 220, 53, 69;        /* Красный */
--color-info: 23, 162, 184;         /* Голубой */
--color-light: 248, 249, 250;       /* Светло-серый */
--color-dark: 9, 18, 24;            /* Очень темный */
--color-white: 255, 255, 255;       /* Белый */
--color-black: 0, 0, 0;             /* Черный */
```

### RGB переменные
```css
--rgb-primary: rgb(var(--color-primary));
--rgb-secondary: rgb(var(--color-secondary));
--rgb-accent: rgb(var(--color-accent));
/* и т.д. */
```

### RGBA переменные с прозрачностью
```css
--rgba-primary-10: rgba(var(--color-primary), 0.1);
--rgba-primary-20: rgba(var(--color-primary), 0.2);
--rgba-primary-30: rgba(var(--color-primary), 0.3);
--rgba-primary-50: rgba(var(--color-primary), 0.5);
--rgba-primary-70: rgba(var(--color-primary), 0.7);
--rgba-primary-90: rgba(var(--color-primary), 0.9);
```

## Темы

### Темная тема
```css
:root.theme-dark {
    --color-primary: 35, 120, 200;
    --color-secondary: 30, 40, 50;
    /* ... */
}
```

### Светлая тема
```css
:root.theme-light {
    --color-primary: 96, 205, 255;
    --color-secondary: 211, 204, 227;
    /* ... */
}
```

## Утилитарные классы

### Фоновые цвета
```html
<div class="bg-primary">Основной фон</div>
<div class="bg-secondary">Вторичный фон</div>
<div class="bg-accent">Акцентный фон</div>
<div class="bg-success">Успех</div>
<div class="bg-warning">Предупреждение</div>
<div class="bg-danger">Ошибка</div>
<div class="bg-info">Информация</div>
```

### Прозрачные фоны
```html
<div class="bg-primary-10">10% прозрачности</div>
<div class="bg-primary-20">20% прозрачности</div>
<div class="bg-primary-30">30% прозрачности</div>
<div class="bg-primary-50">50% прозрачности</div>
<div class="bg-primary-70">70% прозрачности</div>
<div class="bg-primary-90">90% прозрачности</div>
```

### Цвета текста
```html
<span class="text-primary">Основной текст</span>
<span class="text-secondary">Вторичный текст</span>
<span class="text-accent">Акцентный текст</span>
<span class="text-success">Успех</span>
<span class="text-warning">Предупреждение</span>
<span class="text-danger">Ошибка</span>
<span class="text-info">Информация</span>
```

### Границы
```html
<div class="border-primary">Основная граница</div>
<div class="border-secondary">Вторичная граница</div>
<div class="border-accent">Акцентная граница</div>
<div class="border-primary-30">Прозрачная граница</div>
```

### Кнопки
```html
<button class="btn btn-primary">Основная кнопка</button>
<button class="btn btn-secondary">Вторичная кнопка</button>
<button class="btn btn-success">Успех</button>
<button class="btn btn-danger">Ошибка</button>
<button class="btn btn-warning">Предупреждение</button>
```

### Сообщения
```html
<div class="message-success">Сообщение об успехе</div>
<div class="message-error">Сообщение об ошибке</div>
<div class="message-warning">Предупреждение</div>
<div class="message-info">Информационное сообщение</div>
```

### Градиенты
```html
<div class="gradient-primary">Основной градиент</div>
<div class="gradient-secondary">Вторичный градиент</div>
```

### Тени
```html
<div class="shadow-primary">Тень с основным цветом</div>
<div class="shadow-secondary">Тень с вторичным цветом</div>
<div class="shadow-accent">Тень с акцентным цветом</div>
```

### Hover эффекты
```html
<button class="hover-primary">Hover эффект</button>
<button class="hover-accent">Hover акцент</button>
<button class="hover-success">Hover успех</button>
<button class="hover-danger">Hover ошибка</button>
```

### Переходы
```html
<div class="transition-fast">Быстрый переход</div>
<div class="transition-normal">Обычный переход</div>
<div class="transition-slow">Медленный переход</div>
```

## Использование в CSS

### Прямое использование переменных
```css
.my-element {
    background-color: var(--rgb-primary);
    color: var(--rgb-white);
    border: 1px solid var(--rgba-primary-30);
    box-shadow: 0 4px 8px var(--shadow-primary);
}
```

### Использование в calc()
```css
.my-element {
    background-color: rgba(var(--color-primary), 0.5);
    transform: translateY(calc(var(--base-font-size) * 0.5));
}
```

## Изменение цветовой схемы

### Глобальное изменение
Чтобы изменить всю цветовую схему, достаточно изменить значения в `:root`:

```css
:root {
    --color-primary: 255, 0, 0;  /* Изменить на красный */
    --color-accent: 0, 255, 0;   /* Изменить на зеленый */
}
```

### Создание новой темы
```css
:root.theme-custom {
    --color-primary: 128, 0, 128;  /* Фиолетовый */
    --color-secondary: 255, 165, 0; /* Оранжевый */
    --color-accent: 255, 255, 0;    /* Желтый */
}
```

## Совместимость

Система сохраняет совместимость со старыми переменными:
- `--color01` → `--rgb-primary`
- `--color02` → `--rgb-secondary`
- `--color03` → `--rgb-accent`
- `--opacity01` → `--rgba-primary-90`
- и т.д.

## Преимущества новой системы

1. **Централизованное управление** - все цвета в одном месте
2. **Гибкость** - легко создавать новые темы
3. **Консистентность** - единообразное использование цветов
4. **Масштабируемость** - простое добавление новых цветов
5. **Производительность** - CSS переменные работают быстро
6. **Совместимость** - поддержка старых переменных
7. **Удобство** - готовые утилитарные классы

## Рекомендации по использованию

1. Используйте утилитарные классы для быстрого прототипирования
2. Используйте переменные в CSS для кастомных компонентов
3. Создавайте семантические имена для цветов
4. Тестируйте контрастность для доступности
5. Документируйте новые цветовые схемы 