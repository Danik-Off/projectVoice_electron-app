# Строгие правила линтинга и форматирования кода

## Установка зависимостей

```bash
npm install --save-dev @stylistic/eslint-plugin prettier eslint-config-prettier
```

## Основные правила (все на уровне ERROR)

### Форматирование (@stylistic)

- **Отступы**: 4 пробела (строго)
- **Кавычки**: одинарные (`'`) - обязательно
- **Точка с запятой**: обязательна
- **Длина строки**: максимум 120 символов (строго)
- **Конец строки**: LF (Unix) - обязательно
- **Запятые**: без trailing comma - строго
- **Пробелы**: 
  - Всегда вокруг операторов
  - После запятых
  - Внутри объектных литералов `{ key: value }`
  - Перед блоками кода
  - Вокруг стрелок `() => {}`
- **Пустые строки**: максимум 1 подряд, 1 в конце файла, 0 в начале
- **Пробелы в конце строк**: запрещены
- **Скобки**: всегда на новой строке (1tbs стиль)
- **Скобки вокруг стрелочных функций**: всегда `(param) => {}`

### Стиль кода (строгие требования)

- **Именование**: camelCase - обязательно
- **Фигурные скобки**: всегда, даже для однострочных блоков
- **Стрелочные функции**: предпочтительны (error)
- **Const**: обязателен вместо let где возможно
- **Var**: полностью запрещен
- **Template literals**: обязательны вместо конкатенации
- **Object shorthand**: обязателен
- **Arrow body**: without braces if possible
- **Else-return**: запрещен else после return
- **Строгое равенство**: всегда `===` (кроме null)

### TypeScript (максимальная строгость)

- **Неиспользуемые переменные**: ERROR (кроме `_prefixed`)
- **Any**: ERROR (запрещен полностью)
- **Non-null assertion**: ERROR (запрещен)
- **Var**: ERROR (полностью запрещен)
- **Prefer const**: ERROR
- **Consistent type imports**: ERROR - всегда `import type`
- **Consistent type exports**: ERROR
- **TS-комментарии**: ERROR, с обязательным описанием (минимум 5 символов)

### React (строгие правила)

- **Hooks rules**: ERROR - строго по правилам
- **Exhaustive deps**: ERROR - все зависимости обязательны
- **React Refresh**: ERROR - только экспорт компонентов

### Качество кода (строгие метрики)

- **Console.log**: ERROR (разрешены только warn, error)
- **Debugger**: ERROR (полностью запрещен)
- **Alert**: ERROR (полностью запрещен)
- **Максимум строк в файле**: 500 (ERROR)
- **Максимум строк в функции**: 100 (ERROR)
- **Цикломатическая сложность**: максимум 15 (ERROR)
- **Максимальная вложенность**: 4 уровня (ERROR)
- **Максимум параметров функции**: 5 (ERROR)
- **Максимум вложенных callback**: 3 (ERROR)

### Импорты

- **Дубликаты**: ERROR (запрещены полностью)
- **Type imports**: ERROR - всегда отдельно `import type`

## Команды

```bash
# Проверка линтинга
npm run lint

# Автоисправление линтинга
npm run lint:fix

# Форматирование кода
npm run format

# Проверка форматирования
npm run format:check
```

## Что изменилось (строже)

1. **Any запрещен** - было warn, стало error
2. **No-alert** - было warn, стало error
3. **No-else-return** - allowElseIf: false (строже)
4. **Exhaustive-deps** - было warn, стало error
5. **React-refresh** - было warn, стало error
6. **Console.log** - было warn, стало error
7. **Max-len** - ignoreComments: false (строже)
8. **Max-lines** - было warn, стало error
9. **Max-lines-per-function** - 100 строк (было 150), стало error
10. **No-multiple-empty-lines** - max: 1 (было 2)
11. **Добавлены новые метрики**: complexity, max-depth, max-nested-callbacks, max-params
12. **Type imports** - обязательное разделение типов и значений
13. **No-extra-parens** - строгий контроль лишних скобок
14. **Member-delimiter-style** - строгий стиль разделителей в интерфейсах
15. **Type-annotation-spacing** - строгие пробелы в типах

## Примеры правильного кода

### ✅ Правильно

```typescript
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title: string;
}

export const Component: FC<Props> = ({ children, title }) => {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setCount((prev) => prev + 1);
    };

    if (count > 10) {
        return <div>Too many clicks</div>;
    }

    return (
        <div>
            <h1>{title}</h1>
            <button onClick={handleClick}>Count: {count}</button>
            {children}
        </div>
    );
};
```

### ❌ Неправильно

```typescript
// Много ошибок
import { useState, FC, ReactNode } from 'react'; // type imports не разделены

const Component = ({ children, title }) => { // нет типов
    const [count, setCount] = useState(0);
    
    function handleClick() { // должна быть стрелочная
        setCount(count + 1); // нет callback
    }
    
    if (count > 10) return <div>Too many</div>; // нет фигурных скобок
    else { // else после return
        return <div>
            <h1>{title}</h1>
            <button onClick={handleClick}>Count: {count}</button>
            {children}
        </div>;
    }
}
```

## Временное отключение правил

Только в исключительных случаях:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy API требует any
const legacyData: any = oldApi.fetch();

// eslint-disable-next-line max-lines-per-function -- Сложная функция инициализации
function complexInit() {
    // ...
}
```

**Важно**: Всегда указывайте причину отключения правила!
