# ✅ Исправленные проблемы

## Основные исправления

### 1. ✅ Экспорты в features/messaging
- Исправлены экспорты `messageStore` и `messageService` (named вместо default)
- Обновлены все связанные файлы

### 2. ✅ Импорты stores
- Все импорты `serverStore` → `modules/servers`
- Все импорты `channelsStore` → `modules/channels`
- Все импорты `messageStore` → `modules/messaging`
- Все импорты `roomStore` → `features/voice`
- Все импорты `authStore` → `core`
- Все импорты `themeStore` → `core`
- Все импорты `notificationStore` → `core`

### 3. ✅ Импорты services
- Все импорты `inviteService` → `modules/invite`
- Все импорты `serverMembersService` → `modules/servers`

### 4. ✅ Импорты apiClient
- Исправлены в `features/messaging/services/messageService.ts`

## Статус

✅ **Все критические проблемы исправлены!**

Линтер не показывает ошибок. Все основные импорты обновлены на новую модульную архитектуру.

## Осталось (не критично)

Старые файлы в `src/services/` и `src/store/` остаются как legacy, но не используются в новой архитектуре. Их можно удалить после полной проверки.

