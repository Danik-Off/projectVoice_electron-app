# Plugins

Плагины - расширяемая функциональность, которая может быть добавлена или удалена без изменения основного кода.

## Структура плагина

```
plugins/
├── example-plugin/
│   ├── index.ts       # Регистрация плагина
│   ├── plugin.ts      # Реализация плагина
│   └── README.md      # Документация плагина
```

## Создание плагина

```typescript
import { IPlugin } from '../../core';
import { pluginManager } from '../../core';

export const myPlugin: IPlugin = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    dependencies: [], // Опциональные зависимости от других плагинов
    async initialize() {
        // Инициализация плагина
    },
    async destroy() {
        // Очистка при удалении плагина
    },
};

// Регистрация
pluginManager.register(myPlugin);
```

## Примеры плагинов

- `analytics` - аналитика
- `themes` - дополнительные темы
- `notifications` - расширенные уведомления
- `shortcuts` - горячие клавиши

