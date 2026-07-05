/**
 * Типы для feature profile-settings.
 * DTO и формы, специфичные для этого сценария.
 */

import type { User } from '../../../entities/user';

export interface ProfileForm {
    username: string;
    email: string;
}

export interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ValidationErrors {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

/** Состояние хука useProfileSettings */
export interface ProfileSettingsState {
    // Данные пользователя
    user: User | null;

    // UI-состояния модальных окон
    showEditProfile: boolean;
    showPasswordForm: boolean;
    showLogoutConfirm: boolean;

    // Состояния загрузки
    isLoading: boolean;
    isPasswordLoading: boolean;

    // Формы
    editForm: ProfileForm;
    passwordForm: PasswordForm;

    // Ошибки валидации
    validationErrors: ValidationErrors;
}

/** Действия, доступные из UI */
export interface ProfileSettingsActions {
    // Сеттеры форм
    setEditForm: (form: ProfileForm) => void;
    setPasswordForm: (form: PasswordForm) => void;

    // Обработчики профиля
    handleEdit: () => void;
    handleSave: () => Promise<void>;
    handleCancel: () => void;

    // Обработчики пароля
    handleChangePassword: () => void;
    handlePasswordSave: () => Promise<void>;
    handlePasswordCancel: () => void;

    // Обработчики выхода
    handleLogout: () => void;
    confirmLogout: () => void;
    closeLogoutConfirm: () => void;

    // Валидация
    validateProfileForm: () => boolean;
    validatePasswordForm: () => boolean;
}

/** Полный return-тип хука */
export type UseProfileSettingsReturn = ProfileSettingsState & ProfileSettingsActions;
