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
npm run build
```

## Запуск production версии

```bash
npm start
```

## Создание дистрибутива

```bash
npm run dist
```

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

- `npm run dev` - Запуск в режиме разработки
- `npm run dev:full` - Полная разработка с локальным сервером
- `npm run build` - Сборка проекта
- `npm run start` - Запуск production версии
- `npm run dist` - Создание дистрибутива