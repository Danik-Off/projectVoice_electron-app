/**
 * Адаптер ProfileSettingsApi — реализация IProfileSettingsService.
 *
 * Этот слой ИМПОРТИРУЕТ интерфейс из model/ports.ts и реализует его
 * через базовый HTTP-клиент (apiClient).
 *
 * ВАЖНО: api → model (правильно), а НЕ model → api (неправильно).
 */

import { apiClient } from '../../../core';
import { removeToken, removeUser } from '../../../shared/utils/storage';
import type { User, UpdateProfileDTO } from '../../../entities/user';
import type { IProfileSettingsService } from '../model/ports';

export class ProfileSettingsApi implements IProfileSettingsService {
    /**
     * Получить текущего пользователя через /auth/me
     */
    getCurrentUser(): Promise<User> {
        return apiClient<User>('/auth/me', { method: 'GET' });
    }

    /**
     * Обновить профиль.
     * Бэкенд использует PUT /users/ (без id — пользователь определяется по токену).
     */
    updateProfile(data: UpdateProfileDTO): Promise<User> {
        return apiClient<User>(
            '/users/',
            { method: 'PUT' },
            data
        );
    }

    /**
     * Изменить пароль.
     * Бэкенд не имеет отдельного endpoint для смены пароля.
     * Используем PUT /users/ с полями password (если бэкенд поддерживает).
     * TODO: Уточнить у бэкенда endpoint для смены пароля.
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        // Бэкенд не предоставляет отдельный endpoint для смены пароля.
        // Временно используем /users/ с дополнительными полями.
        const body: Record<string, unknown> = { oldPassword, newPassword };
        await apiClient(
            '/users/',
            { method: 'PUT' },
            body
        );
    }

    /**
     * Выход: очистка localStorage и редирект.
     */
    logout(): void {
        removeToken();
        removeUser();
        window.location.href = '/auth';
    }
}
