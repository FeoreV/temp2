# Руководство по миграции на новую систему цветов

## Что изменилось

### Старые переменные → Новые переменные

| Старая переменная | Новая переменная | Описание |
|------------------|------------------|----------|
| `--color1` | `--color-primary` | Основной цвет |
| `--color2` | `--color-secondary` | Вторичный цвет |
| `--color3` | `--color-accent` | Акцентный цвет |
| `--text0` | `--text-primary` | Основной текст |
| `--text1` | `--text-secondary` | Вторичный текст |
| `--text2` | `--text-muted` | Приглушенный текст |

### Старые RGB переменные → Новые RGB переменные

| Старая переменная | Новая переменная |
|------------------|------------------|
| `--color01` | `--rgb-primary` |
| `--color02` | `--rgb-secondary` |
| `--color03` | `--rgb-accent` |

### Старые opacity переменные → Новые RGBA переменные

| Старая переменная | Новая переменная |
|------------------|------------------|
| `--opacity01` | `--rgba-primary-90` |
| `--opacity02` | `--rgba-secondary-90` |
| `--opacity01a` | `--rgba-primary-60` |
| `--opacity02a` | `--rgba-secondary-60` |
| `--opacity01b` | `--rgba-primary-40` |
| `--opacity02b` | `--rgba-secondary-40` |
| `--opacity01c` | `--rgba-primary-20` |
| `--opacity02c` | `--rgba-primary-20` |
| `--opacity03` | `--rgba-accent-50` |
| `--opacity03a` | `--rgba-accent-20` |

## Как мигрировать

### 1. В CSS файлах

#### Старый способ:
```css
.my-element {
    background-color: var(--color01);
    color: var(--text00);
    border: 1px solid var(--opacity01);
}
```

#### Новый способ:
```css
.my-element {
    background-color: var(--rgb-primary);
    color: rgb(var(--text-primary));
    border: 1px solid var(--rgba-primary-90);
}
```

### 2. В HTML с утилитарными классами

#### Старый способ:
```html
<div style="background-color: var(--color01); color: var(--text00);">
    Контент
</div>
```

#### Новый способ:
```html
<div class="bg-primary text-white">
    Контент
</div>
```

### 3. В inline стилях

#### Старый способ:
```html
<div style="background-color: #2378c8; color: #fff;">
    Контент
</div>
```

#### Новый способ:
```html
<div style="background-color: var(--rgb-primary); color: var(--rgb-white);">
    Контент
</div>
```

## Новые возможности

### 1. Утилитарные классы

```html
<!-- Фоны -->
<div class="bg-primary">Основной фон</div>
<div class="bg-secondary">Вторичный фон</div>
<div class="bg-accent">Акцентный фон</div>
<div class="bg-success">Успех</div>
<div class="bg-warning">Предупреждение</div>
<div class="bg-danger">Ошибка</div>

<!-- Прозрачные фоны -->
<div class="bg-primary-10">10% прозрачности</div>
<div class="bg-primary-20">20% прозрачности</div>
<div class="bg-primary-30">30% прозрачности</div>
<div class="bg-primary-50">50% прозрачности</div>
<div class="bg-primary-70">70% прозрачности</div>
<div class="bg-primary-90">90% прозрачности</div>

<!-- Цвета текста -->
<span class="text-primary">Основной текст</span>
<span class="text-secondary">Вторичный текст</span>
<span class="text-accent">Акцентный текст</span>
<span class="text-success">Успех</span>
<span class="text-warning">Предупреждение</span>
<span class="text-danger">Ошибка</span>

<!-- Границы -->
<div class="border-primary">Основная граница</div>
<div class="border-secondary">Вторичная граница</div>
<div class="border-accent">Акцентная граница</div>
<div class="border-primary-30">Прозрачная граница</div>
```

### 2. Компонентные классы

```html
<!-- Кнопки -->
<button class="btn btn-primary">Основная кнопка</button>
<button class="btn btn-secondary">Вторичная кнопка</button>
<button class="btn btn-success">Успех</button>
<button class="btn btn-danger">Ошибка</button>
<button class="btn btn-warning">Предупреждение</button>

<!-- Сообщения -->
<div class="message-success">Сообщение об успехе</div>
<div class="message-error">Сообщение об ошибке</div>
<div class="message-warning">Предупреждение</div>
<div class="message-info">Информационное сообщение</div>

<!-- Градиенты -->
<div class="gradient-primary">Основной градиент</div>
<div class="gradient-secondary">Вторичный градиент</div>

<!-- Тени -->
<div class="shadow-primary">Тень с основным цветом</div>
<div class="shadow-secondary">Тень с вторичным цветом</div>
<div class="shadow-accent">Тень с акцентным цветом</div>

<!-- Hover эффекты -->
<button class="hover-primary transition-normal">Hover эффект</button>
<button class="hover-accent transition-normal">Hover акцент</button>
<button class="hover-success transition-normal">Hover успех</button>
<button class="hover-danger transition-normal">Hover ошибка</button>
```

### 3. Переходы

```html
<div class="transition-fast">Быстрый переход (0.2s)</div>
<div class="transition-normal">Обычный переход (0.3s)</div>
<div class="transition-slow">Медленный переход (0.5s)</div>
```

## Изменение цветовой схемы

### Глобальное изменение
```css
:root {
    --color-primary: 255, 0, 0;    /* Изменить на красный */
    --color-accent: 0, 255, 0;     /* Изменить на зеленый */
    --color-success: 0, 0, 255;    /* Изменить на синий */
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

Старые переменные все еще работают благодаря обратной совместимости:
- `--color01` → `--rgb-primary`
- `--color02` → `--rgb-secondary`
- `--color03` → `--rgb-accent`
- `--opacity01` → `--rgba-primary-90`
- и т.д.

## Демонстрация

Посетите `/color-demo` для просмотра всех доступных цветов и утилитарных классов.

## Рекомендации

1. **Постепенная миграция** - не нужно менять все сразу
2. **Используйте утилитарные классы** для быстрого прототипирования
3. **Используйте переменные** в CSS для кастомных компонентов
4. **Тестируйте контрастность** для доступности
5. **Документируйте** новые цветовые схемы 