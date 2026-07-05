import { apiClient } from '../../../core';

export const userService = {
    /** Получить пользователя по ID (GET /users/{id}) */
    get: (id: number | null = null) => {
        if (id === null) {
            // Получить текущего пользователя по токену
            return apiClient('/users/', { method: 'GET' });
        }
        return apiClient(`/users/${id}`, { method: 'GET' });
    },

    /** Обновить профиль текущего пользователя (PUT /users/) */
    updateProfile: (profileData: { username: string; profilePicture?: string; bio?: string }) => apiClient(
        '/users/',
        { method: 'PUT' },
        profileData
    ),

    /**
     * Смена пароля.
     * Бэкенд не имеет отдельного endpoint для смены пароля.
     * TODO: Уточнить у бэкенда.
     */
    changePassword: (_id: number, oldPassword: string, newPassword: string) => {
        const body: Record<string, unknown> = { oldPassword, newPassword };
        return apiClient(
            '/users/',
            { method: 'PUT' },
            body
        );
    }
};
