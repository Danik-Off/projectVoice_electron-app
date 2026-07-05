/**
 * User Entity — чистый Domain-слой
 * Здесь только типы и интерфейсы сущности.
 * Никаких импортов из внешних слоёв (API, UI, store).
 */

export interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
    isActive?: boolean;
    profilePicture?: string;
    bio?: string;
    status?: string;
    tag?: string;
    createdAt?: string;
    updatedAt?: string;
    blockedAt?: string;
    blockedBy?: string;
    blockReason?: string;
}

/** DTO для обновления профиля */
export interface UpdateProfileDTO {
    username: string;
    profilePicture?: string;
    bio?: string;
}

/** DTO для смены пароля */
export interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

/** Ответ API при логине/регистрации */
export interface AuthResponseDTO {
    user: User;
    token: string;
}
