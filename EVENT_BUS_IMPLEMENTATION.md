# Реализация шины событий (EventBus)

## ✅ Выполнено

### 1. Создана шина событий в core
- ✅ `src/core/events/EventBus.ts` - класс EventBus с методами on, once, off, emit
- ✅ `src/core/events/events.ts` - типы событий и константы
- ✅ Экспортируется из `src/core/index.ts`

### 2. Stores публикуют события

#### Voice Module (`voiceRoomStore`)
- ✅ `VOICE_EVENTS.CHANNEL_CONNECTED` - при подключении к каналу
- ✅ `VOICE_EVENTS.CHANNEL_DISCONNECTED` - при отключении от канала
- ✅ `VOICE_EVENTS.PARTICIPANT_JOINED` - при присоединении участника
- ✅ `VOICE_EVENTS.PARTICIPANT_LEFT` - при отключении участника
- ✅ `VOICE_EVENTS.PARTICIPANTS_UPDATED` - при обновлении списка участников
- ✅ `VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED` - при изменении состояния локального пользователя

#### Channels Module (`channelsStore`)
- ✅ `CHANNELS_EVENTS.CHANNEL_SELECTED` - при выборе канала
- ✅ `CHANNELS_EVENTS.CHANNELS_LOADED` - при загрузке каналов

#### Messaging Module (`messageStore`)
- ✅ `MESSAGING_EVENTS.MESSAGE_CREATED` - при создании сообщения
- ✅ `MESSAGING_EVENTS.MESSAGES_LOADED` - при загрузке сообщений
- ✅ `MESSAGING_EVENTS.CHANNEL_CHANGED` - при изменении канала
- ✅ Подписка на команды: `SEND_MESSAGE`, `UPDATE_MESSAGE`, `DELETE_MESSAGE`

### 3. Компоненты используют события вместо прямых импортов

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

- **Прямых импортов между модулями**: 0
- **Все взаимодействие**: через EventBus из core
- **Типизация событий**: полная
- **Ошибок линтера**: 0

## 🎯 Архитектура

```
┌─────────────┐
│   Module A  │
└──────┬──────┘
       │ emit/on
       ▼
┌─────────────┐
│  EventBus   │ ← core
└──────┬──────┘
       │ emit/on
       ▼
┌─────────────┐
│   Module B  │
└─────────────┘
```

Модули общаются только через EventBus, без прямых зависимостей.
