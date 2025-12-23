# Руководство по миграции на новую архитектуру

## Обзор изменений

Проект был реорганизован в модульную и плагинную архитектуру. Основные изменения:

1. **Core Layer** - базовые сервисы и инфраструктура
2. **Modules Layer** - бизнес-логика по функциональным областям
3. **Plugins Layer** - расширяемая функциональность
4. **Shared Layer** - переиспользуемые компоненты

## Изменения импортов

### Core Services

**Было:**
```typescript
import { apiClient } from '../utils/apiClient';
import { authStore } from '../store/authStore';
import { themeStore } from '../store/ThemeStore';
```

**Стало:**
```typescript
import { apiClient, authStore, themeStore } from '../core';
```

### Stores

**Было:**
```typescript
import { authStore } from '../store/authStore';
import { enableMobX } from '../store/authStore';
```

**Стало:**
```typescript
import { authStore, enableMobX } from '../core';
```

### Config

**Было:**
```typescript
import { API_URL } from '../configs/apiConfig';
import { iceServers } from '../configs/iceServers';
```

**Стало:**
```typescript
import { API_URL, iceServers } from '../core';
```

### Socket Client

**Было:**
```typescript
import SocketClient from '../utils/SocketClient';
```

**Стало:**
```typescript
import { SocketClient } from '../core';
```

### Routes

**Было:**
```typescript
import ProtectedRoute from '../store/ProtectedRoute';
import AdminRoute from '../store/AdminRoute';
```

**Стало:**
```typescript
import { ProtectedRoute, AdminRoute } from '../modules/auth';
```

## Структура файлов

### Новые директории

- `src/core/` - ядро приложения
- `src/modules/` - бизнес-модули
- `src/plugins/` - плагины
- `src/app/` - инициализация приложения

### Перемещенные файлы

- `src/store/authStore.ts` → `src/core/store/authStore.ts`
- `src/store/ThemeStore.ts` → `src/core/store/ThemeStore.ts`
- `src/store/NotificationStore.tsx` → `src/core/store/NotificationStore.tsx`
- `src/utils/apiClient.ts` → `src/core/api/apiClient.ts`
- `src/utils/SocketClient.ts` → `src/core/socket/SocketClient.ts`
- `src/configs/apiConfig.ts` → `src/core/config/index.ts`
- `src/configs/iceServers.ts` → `src/core/config/iceServers.ts`
- `src/services/authService.ts` → `src/modules/auth/services/authService.ts`
- `src/store/ProtectedRoute.tsx` → `src/modules/auth/components/ProtectedRoute.tsx`
- `src/store/AdminRoute.tsx` → `src/modules/auth/components/AdminRoute.tsx`

## Обновление существующего кода

### 1. Обновить импорты stores

Найти все файлы с импортами из `store/` и обновить:

```bash
# Найти все файлы
grep -r "from '../store/" src/
grep -r "from '../../store/" src/
```

### 2. Обновить импорты utils

Найти все файлы с импортами из `utils/` и обновить:

```bash
grep -r "from '../utils/apiClient" src/
grep -r "from '../utils/SocketClient" src/
```

### 3. Обновить импорты configs

Найти все файлы с импортами из `configs/` и обновить:

```bash
grep -r "from '../configs/" src/
```

## Создание нового модуля

1. Создать структуру модуля:
```
src/modules/my-module/
├── components/
├── services/
├── store/
├── hooks/
├── types/
├── index.ts
└── module.ts
```

2. Реализовать модуль:
```typescript
// src/modules/my-module/module.ts
import { IModule } from '../../core';
import MyComponent from './components/MyComponent';

export const myModule: IModule = {
    id: 'my-module',
    name: 'My Module',
    version: '1.0.0',
    routes: [
        {
            path: '/my-module',
            component: MyComponent,
            protected: true,
        },
    ],
    async initialize() {
        console.log('My module initialized');
    },
};
```

3. Зарегистрировать модуль:
```typescript
// src/app/initialize.ts
import { myModule } from '../modules/my-module';
moduleManager.register(myModule);
```

## Создание нового плагина

1. Создать структуру плагина:
```
src/plugins/my-plugin/
├── plugin.ts
├── index.ts
└── README.md
```

2. Реализовать плагин:
```typescript
// src/plugins/my-plugin/plugin.ts
import { IPlugin } from '../../core';

export const myPlugin: IPlugin = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    async initialize() {
        console.log('My plugin initialized');
    },
};
```

3. Зарегистрировать плагин:
```typescript
// src/plugins/my-plugin/index.ts
import { pluginManager } from '../../core';
import { myPlugin } from './plugin';
pluginManager.register(myPlugin);
```

4. Импортировать в приложение:
```typescript
// src/app/initialize.ts
import '../plugins/my-plugin';
```

## Проверка работоспособности

1. Проверить, что приложение запускается:
```bash
npm run dev
```

2. Проверить, что все маршруты работают
3. Проверить, что все импорты корректны:
```bash
npm run lint
```

## Следующие шаги

1. Постепенно мигрировать остальные features в modules
2. Обновить все импорты в существующих файлах
3. Создать больше плагинов для расширения функциональности
4. Добавить систему событий для коммуникации между модулями

## Полезные команды

```bash
# Найти все старые импорты
grep -r "from '../store/authStore'" src/
grep -r "from '../utils/apiClient'" src/
grep -r "from '../configs/" src/

# Найти все файлы, использующие старые пути
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "store/authStore"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "utils/apiClient"
```

