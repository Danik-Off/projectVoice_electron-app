/**
 * Хелперы валидации для feature profile-settings.
 * Делегируют базовые проверки в entities/user/lib/validators
 * и добавляют специфичные для форм сообщения.
 */

import { validateUsername, validateEmail, validatePassword, validatePasswordMatch } from '../../../entities/user';
import type { ProfileForm, PasswordForm, ValidationErrors } from '../model/types';
import type { I18nService } from '../model/ports';

/**
 * Валидация формы профиля.
 * Возвращает ошибки и флаг валидности.
 */
export const validateProfile = (
    form: ProfileForm,
    i18n: I18nService
): { errors: ValidationErrors; isValid: boolean } => {
    const errors: ValidationErrors = {};

    const usernameError = validateUsername(form.username);
    if (usernameError) {
        errors.username = i18n.t('settingsPage.profile.validation.usernameRequired');
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
        errors.email = i18n.t('settingsPage.profile.validation.emailInvalid');
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
};

/**
 * Валидация формы пароля.
 */
export const validatePasswordForm = (
    form: PasswordForm,
    i18n: I18nService
): { errors: ValidationErrors; isValid: boolean } => {
    const errors: ValidationErrors = {};

    if (!form.currentPassword.trim()) {
        errors.currentPassword = i18n.t('settingsPage.profile.validation.currentPasswordRequired');
    }

    const newPasswordError = validatePassword(form.newPassword);
    if (newPasswordError) {
        errors.newPassword = i18n.t('settingsPage.profile.validation.newPasswordRequired');
    }

    const matchError = validatePasswordMatch(form.newPassword, form.confirmPassword);
    if (matchError) {
        errors.confirmPassword = i18n.t('settingsPage.profile.validation.passwordsDoNotMatch');
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
};
