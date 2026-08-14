import { apiClient } from '../../../core';

export const userService = {
    /** Получить текущего пользователя по токену (GET /users) */
    get: (id: number | null = null) => {
        if (id === null) {
            return apiClient('/users', { method: 'GET' });
        }
        return apiClient(`/users/${id}`, { method: 'GET' });
    },

    /**
     * Обновить профиль текущего пользователя (PUT /users).
     * Бэкенд принимает поле `name` (не `username`) в UpdateUserDto.
     */
    updateProfile: (profileData: { username: string; profilePicture?: string; bio?: string }) =>
        apiClient(
            '/users',
            { method: 'PUT' },
            { name: profileData.username, profilePicture: profileData.profilePicture, bio: profileData.bio }
        ),

    /**
     * Удалить аккаунт текущего пользователя (DELETE /users).
     */
    deleteAccount: () => apiClient<{ message: string }>('/users', { method: 'DELETE' }),

    /**
     * Смена пароля.
     * В новом API бэкенда нет отдельного endpoint для смены пароля.
     * TODO: запросить добавление endpoint у бэкенд-команды.
     */
    // eslint-disable-next-line require-await -- Returns rejected promise
    changePassword: async (_id: number, _oldPassword: string, _newPassword: string): Promise<boolean> => {
        throw new Error('Change password endpoint is not available in the current API');
    }
};
