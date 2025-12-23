# Исправленные проблемы

## ✅ Исправлено

### 1. Экспорты в features/messaging
- ✅ Исправлены экспорты `messageStore` и `messageService` (named вместо default)
- ✅ Обновлен `features/messaging/index.ts`
- ✅ Обновлен `modules/messaging/index.ts`

### 2. Импорты в features/messaging
- ✅ Исправлен импорт `authStore` в `messageStore.ts` (теперь из core)
- ✅ Исправлен импорт `apiClient` в `messageService.ts` (теперь из core)

### 3. Импорты stores в pages/
- ✅ `Main.tsx` - roomStore, AudioSettingsStore
- ✅ `ChannelPage.tsx` - serverStore, roomStore
- ✅ Все файлы с `serverStore` → `modules/servers`
- ✅ Все файлы с `channelsStore` → `modules/channels`
- ✅ Все файлы с `messageStore` → `modules/messaging`
- ✅ Все файлы с `roomStore` → `features/voice`
- ✅ Все файлы с `authStore` → `core`

## ⚠️ Осталось исправить

### Импорты apiClient в старых services/
Файлы в `src/services/` все еще используют старые пути, но они не используются (дубликаты).

### Импорты в других компонентах
Нужно проверить:
- `src/components/`
- `src/utils/`
- Другие файлы, использующие старые импорты

## Команды для проверки

```bash
# Найти все старые импорты store
grep -r "from.*store/" src/ --exclude-dir=node_modules

# Найти все старые импорты services
grep -r "from.*services/" src/ --exclude-dir=node_modules

# Найти все старые импорты utils/apiClient
grep -r "from.*utils/apiClient" src/ --exclude-dir=node_modules
```

