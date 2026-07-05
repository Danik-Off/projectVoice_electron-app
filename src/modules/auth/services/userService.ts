import { apiClient } from '../../../core';

export const userService = {
    /** Получить пользователя по ID (GET /users/{id}) */
    get: async (id: number | null = null) => {
        if (id === null) {
            // Получить текущего пользователя по токену
            return apiClient('/users/', { method: 'GET' });
        }
        return apiClient(`/users/${id}`, { method: 'GET' });
    },

    /** Обновить профиль текущего пользователя (PUT /users/) */
    updateProfile: async (profileData: { username: string; profilePicture?: string; bio?: string }) => {
        return apiClient(
            '/users/',
            { method: 'PUT' },
            profileData
        );
    },

    /**
     * Смена пароля.
     * Бэкенд не имеет отдельного endpoint для смены пароля.
     * TODO: Уточнить у бэкенда.
     */
    changePassword: async (_id: number, oldPassword: string, newPassword: string) => {
        return apiClient(
            '/users/',
            { method: 'PUT' },
            { oldPassword, newPassword } as Record<string, unknown>
        );
    }
};
