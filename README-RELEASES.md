# Автоматическая сборка релизов

git push --follow-tags

## Как это работает

При изменении версии в `package.json` и коммите в ветку `main` или `master` автоматически запускается сборка релиза.

## Обновление версии

### Автоматическое обновление версии

**Важно:** Команды `version:patch`, `version:minor`, `version:major` требуют чистого рабочего дерева Git (все изменения должны быть закоммичены).

#### Стандартные команды (с коммитом и тегом)

```bash
# Патч версия (0.0.1 -> 0.0.2)
npm run version:patch

# Минорная версия (0.0.1 -> 0.1.0)
npm run version:minor

# Мажорная версия (0.0.1 -> 1.0.0)
npm run version:major
```

Эти команды:

1. Обновят версию в `package.json`
2. Создадут коммит с сообщением "chore: bump version to X.X.X"
3. Создадут git tag

#### Локальные команды (без коммита, для тестирования)

Если у вас есть незакоммиченные изменения и вы хотите только обновить версию в `package.json`:

```bash
# Патч версия (0.0.1 -> 0.0.2) - только обновление package.json
npm run version:patch:local

# Минорная версия (0.0.1 -> 0.1.0) - только обновление package.json
npm run version:minor:local

# Мажорная версия (0.0.1 -> 1.0.0) - только обновление package.json
npm run version:major:local
```

**Примечание:** Локальные команды только обновляют версию в `package.json` и не создают коммит или тег. Используйте их для тестирования, но для релизов используйте стандартные команды.

### Ручное обновление версии

Вы можете вручную изменить версию в `package.json`:

```json
{
  "version": "0.1.0"
}
```

Затем закоммитьте изменения:

```bash
git add package.json
git commit -m "chore: bump version to 0.1.0"
git push
```

### Решение проблемы "Git working directory not clean"

Если вы получили ошибку `npm error Git working directory not clean`:

1. **Вариант 1 (рекомендуется):** Закоммитьте все изменения перед обновлением версии:

   ```bash
   git add .
   git commit -m "your commit message"
   npm run version:patch
   ```

2. **Вариант 2:** Используйте локальные команды для обновления версии без коммита:

   ```bash
   npm run version:patch:local
   # Затем закоммитьте изменения вручную
   git add package.json
   git commit -m "chore: bump version to 0.0.2"
   ```

## Процесс сборки

1. **Проверка версии**: GitHub Actions проверяет, изменилась ли версия в `package.json`
2. **Сборка**: Если версия изменилась, запускается сборка для всех платформ:
   - Windows (NSIS installer) - `npm run build:win`
   - macOS (DMG) - `npm run build:mac`
   - Linux (AppImage) - `npm run build:linux`
3. **Создание релиза**: После успешной сборки создается GitHub Release с:
   - Тегом версии (v0.1.0)
   - Артефактами сборки для всех платформ
   - Описанием релиза

### Локальная сборка для конкретной платформы

Вы можете собрать приложение для конкретной платформы локально:

```bash
# Сборка для Windows
npm run build:win

# Сборка для macOS
npm run build:mac

# Сборка для Linux
npm run build:linux

# Сборка для текущей платформы (автоматически определяется)
npm run build
```

## Файлы версии

При сборке автоматически обновляется `src/version.json` с информацией:
- `version` - версия из package.json
- `gitHash` - короткий хеш коммита
- `buildDate` - дата сборки
- `buildTimestamp` - полная временная метка

## Ручной запуск сборки

Вы можете вручную запустить сборку через GitHub Actions:

1. Перейдите в раздел "Actions" в репозитории
2. Выберите workflow "Build and Release"
3. Нажмите "Run workflow"
4. Выберите ветку и нажмите "Run workflow"

## Проверка версии в PR

При создании Pull Request с изменениями в `package.json` автоматически проверяется, изменилась ли версия. Если версия не изменилась, будет показано предупреждение.

