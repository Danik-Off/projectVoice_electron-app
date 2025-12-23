# План исправления импортов

## Критичные файлы для исправления:

1. `src/pages/main/Main.tsx` - импорты roomStore, AudioSettingsStore
2. `src/pages/channelPage/ChannelPage.tsx` - импорты serverStore, roomStore
3. Все файлы в `src/pages/` - импорты serverStore, channelsStore, messageStore

## Замены:

```typescript
// serverStore
import serverStore from '../../store/serverStore';
→
import { serverStore } from '../../modules/servers';

// channelsStore
import channelsStore from '../../store/channelsStore';
→
import { channelsStore } from '../../modules/channels';

// messageStore
import { messageStore } from '../../store/messageStore';
→
import { messageStore } from '../../modules/messaging';

// roomStore (из features/voice)
import roomStore from '../../store/roomStore';
→
import { RoomStore as roomStore } from '../../features/voice';

// AudioSettingsStore
import audioSettingsStore from '../../store/AudioSettingsStore';
→
import { AudioSettingsStore as audioSettingsStore } from '../../features/voice';
```

