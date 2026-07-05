/**
 * Ports для feature profile-settings.
 *
 * Здесь описаны интерфейсы сервисов, которые нужны ЭТОЙ фиче.
 * Хук useProfileSettings работает только с этими интерфейсами —
 * он НЕ знает, какая реализация (axios, fetch, mock) используется.
 *
 * Реализация (адаптер) передаётся через DI (React Context) из app/providers.
 */

import type { User, UpdateProfileDTO } from '../../../entities/user';

/**
 * Порт сервиса настроек профиля.
 * Объединяет операции, нужные фиче profile-settings.
 */
export interface IProfileSettingsService {
    /** Получить текущего пользователя */
    getCurrentUser(): Promise<User>;

    /** Обновить профиль (username, profilePicture, bio) */
    updateProfile(data: UpdateProfileDTO): Promise<User>;

    /** Изменить пароль */
    changePassword(oldPassword: string, newPassword: string): Promise<void>;

    /** Выйти из аккаунта */
    logout(): void;
}

/**
 * Порт сервиса уведомлений.
 * Используется хуком для показа success/error сообщений.
 */
export interface INotificationService {
    notify(message: string, type: 'success' | 'error' | 'info'): void;
}

/**
 * Порт сервиса локализации (i18n).
 * Возвращает функцию-переводчик.
 */
export interface I18nService {
    t: (key: string) => string;
}

/**
 * Контракт для DI-контекста — все сервисы, которые фича
 * получает извне через React Context.
 */
export interface ProfileSettingsDeps {
    profileSettingsService: IProfileSettingsService;
    notificationService: INotificationService;
    i18nService: I18nService;
}
