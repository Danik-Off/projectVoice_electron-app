// Метод для получения значения cookie по имени
export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
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
    
    // Проверка, что cookie действительно установлен
    const savedValue = getCookie(name);
    if (savedValue !== value) {
        console.warn(`Cookie ${name} was not saved correctly. Expected: ${value}, Got: ${savedValue}`);
    } else {
        console.log(`Cookie ${name} saved successfully`);
    }
};
