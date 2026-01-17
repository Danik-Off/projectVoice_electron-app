// Метод для получения значения cookie по имени
export const getCookie = (cookie_name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookie_name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? null;
    }
    return null;
};
// Метод для установки cookie
export const setCookie = (name: string, value: string, days: number): void => {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Конвертация дней в миллисекунды
        expires = `; expires=${date.toUTCString()}`;
    }
    // Сохранение cookie с путём и SameSite для безопасности
    document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
};
