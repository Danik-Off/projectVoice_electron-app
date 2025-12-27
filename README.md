# ProjectVoice Electron App

Приложение для голосового общения на базе Electron + React + TypeScript.

## Установка зависимостей

```bash
npm install
```

## Запуск в режиме разработки

### Вариант 1: Только Electron с внешним API
```bash
npm run dev
```

### Вариант 2: Полная разработка с локальным сервером
```bash
npm run dev:full
```

Этот вариант запустит:
- Vite dev server на порту 3000
- Express сервер с mock API
- Electron приложение

## Сборка проекта

```bash
# Сборка для текущей платформы
npm run build

# Сборка для конкретной платформы
npm run build:win   # Windows
npm run build:mac   # macOS (только на macOS)
npm run build:linux # Linux (только на Linux или через Docker/WSL)
```

**Важно:** 
- Сборка Linux AppImage возможна только на Linux системе или через Docker/WSL
- На Windows сборка Linux версии не поддерживается напрямую
- Для сборки Linux используйте CI/CD или Linux окружение

## Структура проекта

- `src/` - React приложение
- `electron/` - Electron главный процесс и preload скрипт
- `server.js` - Express сервер для локальной разработки
- `dist/` - Собранное React приложение
- `dist-electron/` - Готовый дистрибутив Electron

## API

В режиме разработки приложение использует локальный сервер на `localhost:3000`.
В production режиме - внешний API на `http://77.222.58.224:5000`.

## Скрипты

### Разработка
- `npm run dev` - Запуск Electron с Vite dev server
- `npm run dev:full` - Полная разработка с локальным сервером
- `npm run dev:vite` - Только Vite dev server
- `npm run dev:server` - Только локальный сервер

### Сборка
- `npm run build` - Сборка для текущей платформы
- `npm run build:win` - Сборка для Windows
- `npm run build:mac` - Сборка для macOS
- `npm run build:linux` - Сборка для Linux

### Версионирование
- `npm run version:patch` - Увеличить патч-версию (с коммитом)
- `npm run version:minor` - Увеличить минорную версию (с коммитом)
- `npm run version:major` - Увеличить мажорную версию (с коммитом)
- `npm run version:patch:local` - Увеличить патч-версию (без коммита)
- `npm run version:minor:local` - Увеличить минорную версию (без коммита)
- `npm run version:major:local` - Увеличить мажорную версию (без коммита)

### Другое
- `npm run lint` - Проверка кода линтером