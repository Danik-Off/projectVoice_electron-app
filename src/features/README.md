# Feature-Based Architecture

## 🎯 Обзор

ProjectVoice теперь использует **Feature-based архитектуру** - современный подход к организации кода в React приложениях, где код группируется по бизнес-функциям, а не по техническим слоям.

## 📁 Структура

```
src/
├── features/                    # Бизнес-функции
│   ├── voice/                  # Голосовое общение
│   │   ├── components/         # VoiceRoom, AudioSettings
│   │   ├── hooks/             # useVoice, useAudioSettings
│   │   ├── services/          # VoiceActivityService
│   │   ├── store/             # AudioSettingsStore, RoomStore
│   │   ├── utils/             # WebRTCClient, audioOptimization
│   │   ├── types/             # WebRTCClient.types
│   │   ├── constants/         # WebRTCClient.constants
│   │   └── index.ts           # Публичный API
│   │
│   ├── messaging/             # Сообщения
│   │   ├── components/        # MessageList, MessageInput
│   │   ├── hooks/             # useMessages
│   │   ├── services/          # MessageService
│   │   ├── store/             # MessageStore
│   │   ├── types/             # message.ts
│   │   └── index.ts           # Публичный API
│   │
│   ├── servers/               # Серверы (планируется)
│   ├── settings/              # Настройки (планируется)
│   └── auth/                  # Аутентификация (планируется)
│
├── shared/                    # Общие компоненты
│   ├── components/           # Modal, ClickableAvatar
│   ├── hooks/                # useUserProfileModal
│   ├── utils/                 # apiClient, cookie
│   └── index.ts               # Публичный API
│
└── pages/                     # Страницы приложения
    ├── channelPage/           # Страница канала
    ├── settings/              # Страница настроек
    └── ...
```

## 🚀 Использование

### Voice Feature (Голосовое общение)

```typescript
import { 
  VoiceRoom, 
  AudioSettings, 
  useVoice, 
  useAudioSettings,
  VoiceStore 
} from '../features/voice';

const MyComponent = () => {
  const { joinRoom, leaveRoom, isConnected } = useVoice();
  const { updateVolume, volume } = useAudioSettings();
  
  return (
    <div>
      <VoiceRoom />
      <AudioSettings />
    </div>
  );
};
```

### Messaging Feature (Сообщения)

```typescript
import { 
  MessageList, 
  MessageInput, 
  useMessages 
} from '../features/messaging';

const ChatComponent = () => {
  const { messages, sendMessage } = useMessages();
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};
```

### Shared Components (Общие компоненты)

```typescript
import { Modal, ClickableAvatar, useUserProfileModal } from '../shared';

const MyComponent = () => {
  const { openProfile } = useUserProfileModal();
  
  return (
    <div>
      <ClickableAvatar onClick={openProfile} />
      <Modal>Content</Modal>
    </div>
  );
};
```

## 🔧 Преимущества

### ✅ **Логическая группировка**
- Все что связано с голосом в одном месте
- Легко найти нужный код
- Понятная структура для новых разработчиков

### ✅ **Простые импорты**
```typescript
// ✅ Один импорт для всей функции
import { VoiceRoom, useVoice, VoiceStore } from '../features/voice';

// ❌ Множественные импорты
import { VoiceRoom } from '../components/VoiceRoom';
import { useVoice } from '../hooks/useVoice';
import { VoiceStore } from '../store/VoiceStore';
```

### ✅ **Независимая разработка**
- Каждая команда работает со своей feature
- Минимальные конфликты при слиянии
- Легко добавлять новые функции

### ✅ **Переиспользование**
- Features можно легко перенести в другие проекты
- Общие компоненты в shared папке
- Четкое разделение ответственности

## 📋 Миграция

### Этап 1: ✅ Создание структуры
- Создана папка `features/`
- Создана папка `shared/`
- Созданы подпапки для каждой feature

### Этап 2: ✅ Миграция Voice Feature
- Перенесены компоненты: VoiceRoom, AudioSettings
- Перенесены стор: AudioSettingsStore, RoomStore, ParticipantVolumeStore
- Перенесены утилиты: WebRTCClient, audioOptimization, audioTest
- Перенесены сервисы: VoiceActivityService
- Созданы хуки: useVoice, useAudioSettings, useParticipants
- Создан публичный API в index.ts

### Этап 3: ✅ Миграция Messaging Feature
- Перенесены компоненты: MessageList, MessageInput, MessageItem
- Перенесены стор: MessageStore
- Перенесены сервисы: MessageService
- Перенесены типы: message.ts
- Создан публичный API в index.ts

### Этап 4: ✅ Создание Shared
- Перенесены общие компоненты: Modal, ClickableAvatar
- Перенесены хуки: useUserProfileModal
- Перенесены утилиты: apiClient, cookie
- Создан публичный API в index.ts

### Этап 5: 🔄 Обновление импортов (в процессе)
- Обновление всех импортов в проекте
- Замена прямых импортов на feature-based
- Тестирование новой архитектуры

## 🎯 Следующие шаги

1. **Завершить миграцию остальных features:**
   - Servers feature
   - Settings feature  
   - Auth feature

2. **Обновить все импорты в проекте**

3. **Создать дополнительные хуки для каждой feature**

4. **Добавить тесты для features**

5. **Оптимизировать bundle size с помощью lazy loading**

## 📚 Документация

- [Voice Feature API](./features/voice/index.ts)
- [Messaging Feature API](./features/messaging/index.ts)
- [Shared Components API](./shared/index.ts)

## 🤝 Участие в разработке

При добавлении новых функций следуйте принципам feature-based архитектуры:

1. **Определите к какой feature относится новая функция**
2. **Создайте компоненты в соответствующей папке**
3. **Добавьте хуки для логики**
4. **Обновите публичный API в index.ts**
5. **Добавьте типы в types/ папку**

## 🔍 Примеры

### Создание нового хука для Voice Feature

```typescript
// features/voice/hooks/useVoiceRoom.ts
import { useCallback } from 'react';
import { RoomStore } from '../store/roomStore';

export const useVoiceRoom = () => {
  const createRoom = useCallback(async (roomData) => {
    // Логика создания комнаты
  }, []);

  return {
    createRoom,
    // другие методы
  };
};
```

### Обновление публичного API

```typescript
// features/voice/index.ts
export { useVoiceRoom } from './hooks/useVoiceRoom';
```

### Использование в компоненте

```typescript
import { useVoiceRoom } from '../features/voice';

const MyComponent = () => {
  const { createRoom } = useVoiceRoom();
  // ...
};
```

---

**Feature-based архитектура делает код более организованным, понятным и легким в поддержке!** 🎉
