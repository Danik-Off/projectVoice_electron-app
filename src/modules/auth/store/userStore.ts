/**
 * UserStore - легковесная обертка над authStore для обратной совместимости
 * Использует authStore из core вместо дублирования логики
 *
 * @deprecated Используйте authStore напрямую из core
 */
import { authStore } from '../../../core';

class UserStore {
    /**
     * Получить данные пользователя
     * @deprecated Используйте authStore.user напрямую
     */
    async get(id: number | null) {
        // Если запрашивается текущий пользователь, используем authStore
        if (id === null || (authStore.user && id === authStore.user.id)) {
            // Обновляем данные пользователя из сервера
            await authStore.loadUserData();
            return authStore.user;
        }

        // Для других пользователей можно добавить отдельный метод в authStore
        // Пока возвращаем null, так как это не основная функциональность
        console.warn('Getting other users is not supported. Use authStore.user for current user.');
        return null;
    }

    /**
     * Обновление профиля пользователя
     * Делегирует вызов в authStore
     */
    async updateProfile(profileData: { username: string; email: string }): Promise<boolean> {
        return authStore.updateProfile(profileData);
    }

    /**
     * Изменение пароля пользователя
     * Делегирует вызов в authStore
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        return authStore.changePassword(oldPassword, newPassword);
    }

    /**
     * Получить текущего пользователя
     * @deprecated Используйте authStore.user напрямую
     */
    get currentUser() {
        return authStore.user;
    }

    /**
     * Проверка авторизации
     * @deprecated Используйте authStore.isAuthenticated напрямую
     */
    get isAuthenticated() {
        return authStore.isAuthenticated;
    }

    /**
     * Получить токен
     * @deprecated Используйте authStore.getToken() напрямую
     */
    get token() {
        return authStore.getToken();
    }
}

export const userStore = new UserStore();
