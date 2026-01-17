// Метод для получения значения cookie по имени
export const getCookie = (cookieName: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() ?? null;
    }
    return null;
};
// Метод для установки cookie
export const setCookie = (cookieName: string, value: string, days: number): void => {
    let expires = '';
    if (days > 0) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Конвертация дней в миллисекунды
        expires = `; expires=${date.toUTCString()}`;
    }
    // Сохранение cookie с путём и SameSite для безопасности
    document.cookie = `${cookieName}=${value ?? ''}${expires}; path=/; SameSite=Lax`;
};
