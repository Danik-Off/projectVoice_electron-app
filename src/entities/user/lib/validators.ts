/**
 * Чистые функции валидации для сущности User.
 * Не зависят от React, MobX или любого внешнего сервиса.
 */

export const validateUsername = (username: string): string | null => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be at most 20 characters';
    return null;
};

export const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be at most 50 characters';
    return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword.trim()) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
};
