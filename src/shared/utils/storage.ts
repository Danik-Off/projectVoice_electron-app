/**
 * Утилиты для работы с localStorage
 * Используется для хранения токена авторизации и данных пользователя
 */
import type { User } from '../../types/user';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Сохраняет токен в localStorage
 */
export const saveToken = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('❌ Failed to save token to localStorage:', error);
        throw error;
    }
};

/**
 * Получает токен из localStorage
 */
export const getToken = (): string | null => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('❌ Failed to get token from localStorage:', error);
        return null;
    }
};

/**
 * Удаляет токен из localStorage
 */
export const removeToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('❌ Failed to remove token from localStorage:', error);
    }
};

/**
 * Проверяет, есть ли токен в localStorage
 */
export const hasToken = (): boolean => getToken() !== null;

/**
 * Сохраняет данные пользователя в localStorage
 */
export const saveUser = (user: User): void => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('❌ Failed to save user data to localStorage:', error);
    }
};

/**
 * Получает данные пользователя из localStorage
 */
export const getUser = (): User | null => {
    try {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr != null && userStr.length > 0) {
            return JSON.parse(userStr) as User;
        }
        return null;
    } catch (error) {
        console.error('❌ Failed to get user data from localStorage:', error);
        return null;
    }
};

/**
 * Удаляет данные пользователя из localStorage
 */
export const removeUser = (): void => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('❌ Failed to remove user data from localStorage:', error);
    }
};
