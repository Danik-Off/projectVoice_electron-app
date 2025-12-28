/**
 * API Client - базовый HTTP клиент
 */
import { API_URL } from '../config';
import { getToken } from '../../shared/utils/storage';
import { connectionStore } from '../store/ConnectionStore';

/**
 * Проверяет, является ли ошибка ошибкой протухшего/недействительного токена
 */
function isTokenExpiredError(response: Response, errorMessage: string): boolean {
    // Проверяем статус 401 (Unauthorized)
    if (response.status === 401) {
        return true;
    }

    // Проверяем различные варианты сообщений об ошибке токена
    try {
        const errorJson = JSON.parse(errorMessage);
        const errorText = errorJson.error?.toLowerCase() || '';
        
        // Различные варианты сообщений о протухшем токене
        const tokenErrorPatterns = [
            'недействительный токен',
            'invalid token',
            'token expired',
            'токен истек',
            'token is expired',
            'unauthorized',
            'не авторизован',
            'token invalid',
            'токен недействителен'
        ];

        return tokenErrorPatterns.some(pattern => 
            errorText.includes(pattern.toLowerCase())
        );
    } catch {
        // Если не удалось распарсить JSON, проверяем текст напрямую
        const errorText = errorMessage.toLowerCase();
        return errorText.includes('token') && (
            errorText.includes('expired') || 
            errorText.includes('invalid') || 
            errorText.includes('недействительный') ||
            errorText.includes('истек')
        );
    }
}

export const apiClient = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    body?: unknown
): Promise<T> => {
    const token = getToken();

    // Установка заголовков
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    // Создание объекта запроса
    const requestOptions: RequestInit = {
        ...options,
        headers,
    };

    // Если тело запроса передано, сериализуем его в JSON
    if (body) {
        requestOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

        if (!response.ok) {
            const errorMessage = await response.text();

            // Проверяем, является ли это ошибкой протухшего токена
            // НЕ вызываем logout автоматически - пользователь должен выйти вручную через кнопку
            if (isTokenExpiredError(response, errorMessage)) {
                console.warn('Token expired or invalid, but keeping user authenticated until manual logout');
                // Можно показать уведомление, но не разлогиниваем автоматически
            }
            
            throw new Error(errorMessage);
        }

        // Если запрос прошел успешно, значит подключение есть
        connectionStore.setConnected(true);

        // Для ответов с кодом 204 (No Content) не пытаемся парсить JSON
        if (response.status === 204) {
            return null;
        }

        return response.json() as Promise<T>;
    } catch (error) {
        // Проверяем, является ли это ошибкой сети
        if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
            connectionStore.setConnected(false);
        }
        throw error;
    }
};

