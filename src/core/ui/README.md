# Core UI Kit

Базовый набор UI компонентов для всего приложения. Все компоненты используют единую дизайн-систему и поддерживают темы.

## Компоненты

### Button

Кнопка с различными вариантами стилей.

```tsx
import { Button } from '../../../core';

<Button variant="primary" size="medium" onClick={handleClick}>
    Нажми меня
</Button>

<Button variant="danger" loading={isLoading}>
    Удалить
</Button>

<Button variant="test" fullWidth>
    Тест
</Button>
```

**Варианты:** `primary`, `secondary`, `danger`, `test`, `ghost`  
**Размеры:** `small`, `medium`, `large`

### Input

Текстовое поле ввода.

```tsx
import { Input } from '../../../core';

<Input
    label="Имя пользователя"
    placeholder="Введите имя"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    helperText="Минимум 3 символа"
/>;
```

### Select

Выпадающий список.

```tsx
import { Select } from '../../../core';

<Select
    label="Выберите устройство"
    options={[
        { value: '1', label: 'Микрофон 1' },
        { value: '2', label: 'Микрофон 2' }
    ]}
    value={selectedDevice}
    onChange={(e) => setSelectedDevice(e.target.value)}
/>;
```

### Textarea

Многострочное текстовое поле.

```tsx
import { Textarea } from '../../../core';

<Textarea label="Сообщение" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />;
```

### Checkbox

Чекбокс.

```tsx
import { Checkbox } from '../../../core';

<Checkbox
    label="Включить уведомления"
    checked={notificationsEnabled}
    onChange={(e) => setNotificationsEnabled(e.target.checked)}
/>;
```

### Radio

Радио-кнопка.

```tsx
import { Radio } from '../../../core';

<Radio
    name="quality"
    value="high"
    label="Высокое качество"
    checked={quality === 'high'}
    onChange={(e) => setQuality(e.target.value)}
/>;
```

### Toggle

Переключатель (switch).

```tsx
import { Toggle } from '../../../core';

<Toggle
    label="Включить микрофон"
    checked={micEnabled}
    onChange={(e) => setMicEnabled(e.target.checked)}
    helperText="Включение/отключение микрофона"
/>;
```

### Slider

Ползунок для выбора значения.

```tsx
import { Slider } from '../../../core';

<Slider
    label="Громкость"
    min={0}
    max={100}
    value={volume}
    onChange={(e) => setVolume(Number(e.target.value))}
    showValue
    helperText="Уровень громкости (0-100%)"
/>;
```

### Card

Карточка для группировки контента.

```tsx
import { Card } from '../../../core';

<Card title="Настройки аудио" description="Настройка микрофона и динамиков" icon="🎤">
    {/* Содержимое карточки */}
</Card>;
```

### SettingGroup

Группа настроек с заголовком и описанием.

```tsx
import { SettingGroup } from '../../../core';

<SettingGroup label="Микрофон" description="Выберите устройство для записи голоса">
    <Select options={microphones} />
</SettingGroup>;
```

### Label

Метка для полей формы.

```tsx
import { Label } from '../../../core';

<Label htmlFor="username" required>
    Имя пользователя
</Label>;
```

## Использование в модулях

Все компоненты экспортируются из `core`:

```tsx
import { Button, Input, Select, Card, SettingGroup, Toggle, Slider } from '../../../core';
```

## Стилизация

Все компоненты используют CSS переменные из темы, поэтому автоматически поддерживают светлую и темную темы. Стили определены в соответствующих `.scss` файлах.

## Примеры использования

### Форма настроек

```tsx
import { Card, SettingGroup, Select, Toggle, Slider, Button } from '../../../core';

<Card title="Настройки аудио" icon="🎤">
    <SettingGroup label="Микрофон" description="Выберите устройство">
        <Select options={microphones} value={selectedMic} onChange={handleMicChange} />
    </SettingGroup>

    <SettingGroup label="Громкость" description="Уровень записи">
        <Slider min={0} max={200} value={volume} onChange={handleVolumeChange} showValue />
    </SettingGroup>

    <SettingGroup label="Управление">
        <Toggle label="Включить микрофон" checked={!isMuted} onChange={handleToggleMic} />
    </SettingGroup>

    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <Button variant="primary" onClick={handleApply}>
            Применить
        </Button>
        <Button variant="secondary" onClick={handleReset}>
            Сбросить
        </Button>
    </div>
</Card>;
```
