# Список исправлений: Шина событий и устранение зависимостей между модулями

## ✅ Выполнено

### 1. Создана шина событий в core
- ✅ `src/core/events/EventBus.ts` - класс EventBus
- ✅ `src/core/events/events.ts` - типы событий и константы
- ✅ Экспортируется из `src/core/index.ts`

### 2. Stores публикуют события

#### Voice Module (`voiceRoomStore`)
- ✅ `VOICE_EVENTS.CHANNEL_CONNECTED` - при подключении
- ✅ `VOICE_EVENTS.CHANNEL_DISCONNECTED` - при отключении
- ✅ `VOICE_EVENTS.PARTICIPANT_JOINED` - участник присоединился
- ✅ `VOICE_EVENTS.PARTICIPANT_LEFT` - участник покинул
- ✅ `VOICE_EVENTS.PARTICIPANTS_UPDATED` - обновление списка
- ✅ `VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED` - изменение состояния

#### Channels Module (`channelsStore`)
- ✅ `CHANNELS_EVENTS.CHANNEL_SELECTED` - выбор канала
- ✅ `CHANNELS_EVENTS.CHANNELS_LOADED` - загрузка каналов

#### Messaging Module (`messageStore`)
- ✅ `MESSAGING_EVENTS.MESSAGE_CREATED` - создание сообщения
- ✅ `MESSAGING_EVENTS.MESSAGES_LOADED` - загрузка сообщений
- ✅ `MESSAGING_EVENTS.CHANNEL_CHANGED` - изменение канала
- ✅ Подписка на команды: `SEND_MESSAGE`, `UPDATE_MESSAGE`, `DELETE_MESSAGE`

### 3. Компоненты используют события

#### Servers Module
- ✅ `ChannelPage.tsx` - подписка на `VOICE_EVENTS.CHANNEL_CONNECTED/DISCONNECTED`
- ✅ `MessageList.tsx` - подписка на события каналов, сообщений, голосового канала
- ✅ `MessageItem.tsx` - отправка команд `UPDATE_MESSAGE`, `DELETE_MESSAGE`
- ✅ `MessageInput.tsx` - отправка команды `SEND_MESSAGE`
- ✅ `VoiceRoom.tsx` - подписка на события участников
- ✅ `ChannelsSettings.tsx` - подписка на `CHANNELS_EVENTS.CHANNELS_LOADED`

#### Messaging Module
- ✅ `MessageList.tsx` - подписка на события каналов и голосового канала

## 📊 Результат

- **Прямых импортов между модулями**: ✅ 0
- **Все взаимодействие**: через EventBus из core
- **Типизация событий**: полная
- **Ошибок линтера**: 0

## 🎯 Архитектура

```
Module A ──emit──> EventBus <──on── Module B
                    (core)
```

Модули общаются только через EventBus, без прямых зависимостей.
