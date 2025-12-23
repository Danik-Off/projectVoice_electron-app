# Структура проекта ProjectVoice

## Новая архитектура

```
src/
├── core/                      # 🎯 Ядро приложения
│   ├── api/                   # API клиент
│   │   └── apiClient.ts
│   ├── socket/                # Socket.io клиент
│   │   └── SocketClient.ts
│   ├── store/                 # Базовые stores
│   │   ├── authStore.ts
│   │   ├── ThemeStore.ts
│   │   ├── NotificationStore.tsx
│   │   └── index.ts
│   ├── config/                # Конфигурация
│   │   ├── index.ts
│   │   └── iceServers.ts
│   ├── plugin/                # Система плагинов
│   │   └── PluginManager.ts
│   ├── module/                # Система модулей
│   │   └── ModuleManager.ts
│   ├── types/                 # Базовые типы
│   │   └── index.ts
│   ├── index.ts               # Экспорт core
│   └── README.md
│
├── modules/                   # 📦 Бизнес-модули
│   ├── auth/                  # Модуль аутентификации
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── module.ts          # Регистрация модуля
│   │   └── index.ts           # Публичный API
│   ├── voice/                 # Модуль голосового общения
│   │   ├── module.ts
│   │   └── index.ts
│   ├── messaging/             # Модуль сообщений
│   │   ├── module.ts
│   │   └── index.ts
│   └── README.md
│
├── plugins/                   # 🔌 Плагины
│   ├── example-plugin/
│   │   ├── plugin.ts
│   │   └── index.ts
│   └── README.md
│
├── features/                  # 📁 Features (legacy, постепенно мигрируем)
│   ├── voice/
│   ├── messaging/
│   └── servers/
│
├── shared/                    # 🔄 Общие компоненты
│   ├── components/
│   │   ├── Modal.tsx
│   │   └── ClickableAvatar.tsx
│   ├── hooks/
│   │   └── useUserProfileModal.ts
│   ├── utils/
│   │   └── cookie.ts
│   ├── index.ts
│   └── README.md
│
├── pages/                     # 📄 Страницы приложения
│   ├── auth/
│   ├── main/
│   ├── channelPage/
│   ├── settings/
│   └── ...
│
├── app/                       # 🚀 Инициализация приложения
│   ├── initialize.ts          # Регистрация модулей и плагинов
│   ├── routes.tsx             # Сборка маршрутов
│   └── index.ts
│
├── styles/                    # 🎨 Глобальные стили
│   ├── main.scss
│   ├── _colors.scss
│   └── ...
│
├── App.tsx                    # Главный компонент
├── main.tsx                   # Точка входа
│
├── ARCHITECTURE.md            # Документация архитектуры
├── MIGRATION_GUIDE.md         # Руководство по миграции
└── STRUCTURE.md               # Этот файл
```

## Ключевые принципы

### 1. Core Layer
- ✅ Базовые сервисы (API, Socket, WebRTC)
- ✅ Базовые stores (auth, theme, notifications)
- ✅ Конфигурация приложения
- ✅ Системы плагинов и модулей
- ❌ Нет бизнес-логики

### 2. Modules Layer
- ✅ Бизнес-логика по функциональным областям
- ✅ Независимые модули
- ✅ Могут предоставлять маршруты
- ✅ Зависимости только от core и shared

### 3. Plugins Layer
- ✅ Расширяемая функциональность
- ✅ Могут зависеть от других плагинов
- ✅ Легко добавлять/удалять

### 4. Shared Layer
- ✅ Переиспользуемые компоненты
- ✅ Утилиты
- ✅ Общие типы
- ❌ Нет бизнес-логики

## Импорты

### Из Core
```typescript
import { apiClient, authStore, themeStore, SocketClient } from '../core';
```

### Из Modules
```typescript
import { ProtectedRoute, AdminRoute } from '../modules/auth';
import { VoiceRoom } from '../modules/voice';
```

### Из Shared
```typescript
import { Modal, ClickableAvatar } from '../shared';
import { getCookie, setCookie } from '../shared';
```

## Инициализация

Приложение инициализируется в `src/app/initialize.ts`:

1. Включается MobX
2. Регистрируются модули
3. Инициализируются модули (с учетом зависимостей)
4. Инициализируются плагины

## Маршруты

Маршруты автоматически собираются из зарегистрированных модулей в `src/app/routes.tsx`.

## Дополнительная информация

- Подробная документация: `ARCHITECTURE.md`
- Руководство по миграции: `MIGRATION_GUIDE.md`

