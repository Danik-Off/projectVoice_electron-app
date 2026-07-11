/**
 * Чистые функции валидации URL.
 * Не зависят от React, MobX или любого внешнего сервиса.
 */

/**
 * Валидация URL сервера.
 * Проверяет наличие протокола и корректный формат.
 */
export const validateServerUrl = (url: string): string | null => {
    const trimmed = url.trim();

    if (trimmed.length === 0) {
        return 'URL is required';
    }

    // Проверяем наличие протокола
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return 'URL must start with http:// or https://';
    }

    // Проверяем корректность URL через конструктор (бросает исключение при неверном формате)
    try {
        // eslint-disable-next-line no-new -- используется только для валидации формата
        new URL(trimmed);
    } catch {
        return 'Invalid URL format';
    }

    return null;
};

/**
 * Нормализация URL: добавляет протокол, убирает trailing slash.
 */
export const normalizeServerUrl = (url: string): string => {
    let result = url.trim();

    if (!result.startsWith('http://') && !result.startsWith('https://')) {
        result = `http://${result}`;
    }

    if (result.endsWith('/')) {
        result = result.slice(0, -1);
    }

    return result;
};

/**
 * Маскирование URL для отображения (скрывает порт в некоторых случаях).
 */
export const formatUrlForDisplay = (url: string): string => {
    try {
        const parsed = new URL(url);
        return parsed.host;
    } catch {
        return url;
    }
};
