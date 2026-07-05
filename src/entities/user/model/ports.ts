/**
 * Ports - интерфейсы (абстракции) для внешних сервисов.
 * Внутренний слой (Domain) определяет только ПОРТЫ,
 * но НЕ знает, как они реализованы (axios, fetch, localStorage).
 *
 * Реализации (адаптеры) живут во внешнем слое (features/{name}/api, shared/api).
 */

import type { User, UpdateProfileDTO, ChangePasswordDTO, AuthResponseDTO } from './types';

/**
 * Порт репозитория пользователя.
 * Описывает ВСЕ операции с пользователем, которые нужны домену.
 * Реализация - в features/profile-settings/api/ProfileSettingsApi.ts
 */
export interface IUserRepository {
    /** Получить текущего авторизованного пользователя */
    getCurrentUser(): Promise<User>;

    /** Получить пользователя по ID */
    getById(id: number): Promise<User>;

    /** Обновить профиль пользователя (текущего, по токену) */
    updateProfile(data: UpdateProfileDTO): Promise<User>;

    /** Изменить пароль пользователя */
    changePassword(data: ChangePasswordDTO): Promise<boolean>;
}

/**
 * Порт сервиса аутентификации.
 * Отвечает за login/register/logout.
 */
export interface IAuthService {
    login(email: string, password: string): Promise<AuthResponseDTO>;
    register(email: string, username: string, password: string): Promise<AuthResponseDTO>;
    logout(): void;
}
