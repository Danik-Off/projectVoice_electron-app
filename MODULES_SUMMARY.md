# Сводка по модулям

## Созданные модули

### ✅ 1. Auth Module (`modules/auth`)
**Назначение**: Аутентификация и управление пользователями

**Компоненты**:
- `ProtectedRoute` - защищенный маршрут
- `AdminRoute` - маршрут для администраторов

**Сервисы**:
- `authService` - аутентификация (login, register, getMe)
- `userService` - управление пользователями (get, updateProfile, changePassword)

**Stores**:
- `authStore` - в core/store (базовый)
- `userStore` - управление данными пользователя

**Маршруты**:
- `/auth` - страница аутентификации

---

### ✅ 2. Servers Module (`modules/servers`)
**Назначение**: Управление серверами

**Сервисы**:
- `serverService` - CRUD операции с серверами
- `serverMembersService` - управление участниками сервера

**Stores**:
- `serverStore` - состояние серверов

**Маршруты**:
- `server/:serverId` - страница сервера
- `server/:serverId/settings` - настройки сервера

**Зависимости**: `auth`

---

### ✅ 3. Channels Module (`modules/channels`)
**Назначение**: Управление каналами

**Сервисы**:
- `channelService` - CRUD операции с каналами

**Stores**:
- `channelsStore` - состояние каналов

**Маршруты**: нет (используется внутри servers)

**Зависимости**: `auth`, `servers`

---

### ✅ 4. Voice Module (`modules/voice`)
**Назначение**: Голосовое общение

**Компоненты**: из `features/voice`
- `VoiceRoom` - комната голосового общения
- `AudioSettings` - настройки аудио

**Маршруты**:
- `server/:serverId/voiceRoom/:roomId` - голосовая комната

**Зависимости**: `auth`

---

### ✅ 5. Messaging Module (`modules/messaging`)
**Назначение**: Текстовые сообщения

**Компоненты**: из `features/messaging`
- `MessageList` - список сообщений
- `MessageInput` - ввод сообщений
- `MessageItem` - элемент сообщения

**Маршруты**:
- `server/:serverId/textRoom/:roomId` - текстовый канал

**Зависимости**: `auth`

---

### ✅ 6. Admin Module (`modules/admin`)
**Назначение**: Администрирование системы

**Сервисы**:
- `adminService` - админские операции (статистика, управление пользователями и серверами)

**Маршруты**:
- `admin` - админ панель (требует права администратора)

**Зависимости**: `auth`

---

### ✅ 7. Invite Module (`modules/invite`)
**Назначение**: Система приглашений

**Сервисы**:
- `inviteService` - создание и обработка приглашений

**Маршруты**:
- `/invite/:token` - страница принятия приглашения (публичный)

**Зависимости**: `auth`

---

### ✅ 8. Settings Module (`modules/settings`)
**Назначение**: Настройки пользователя

**Маршруты**:
- `settings` - страница настроек

**Зависимости**: `auth`

---

## Структура модуля

Каждый модуль следует стандартной структуре:

```
modules/[module-name]/
├── components/      # Компоненты модуля (опционально)
├── services/        # Сервисы модуля
├── store/           # Stores модуля (опционально)
├── hooks/           # Хуки модуля (опционально)
├── types/           # Типы модуля (опционально)
├── module.ts        # Регистрация модуля
└── index.ts         # Публичный API модуля
```

## Зависимости между модулями

```
auth (базовый)
  ├── servers
  │     └── channels
  ├── voice
  ├── messaging
  ├── admin
  ├── invite
  └── settings
```

## Регистрация модулей

Все модули регистрируются в `src/app/initialize.ts`:

```typescript
moduleManager.register(authModule);
moduleManager.register(serversModule);
moduleManager.register(channelsModule);
moduleManager.register(voiceModule);
moduleManager.register(messagingModule);
moduleManager.register(adminModule);
moduleManager.register(inviteModule);
moduleManager.register(settingsModule);
```

## Использование модулей

### Импорт сервисов:
```typescript
import { serverService } from '../modules/servers';
import { channelService } from '../modules/channels';
import { adminService } from '../modules/admin';
```

### Импорт stores:
```typescript
import { serverStore } from '../modules/servers';
import { channelsStore } from '../modules/channels';
```

### Импорт компонентов:
```typescript
import { ProtectedRoute, AdminRoute } from '../modules/auth';
```

## Следующие шаги

1. ✅ Все основные модули созданы
2. ⚠️ Обновить импорты в существующих файлах
3. ⚠️ Мигрировать остальные features в модули (если есть)
4. ⚠️ Создать дополнительные плагины

