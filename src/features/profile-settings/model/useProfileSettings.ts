/**
 * useProfileSettings — хук-ядро feature profile-settings.
 *
 * ПРИНЦИП ИНВЕРСИИ ЗАВИСИМОСТЕЙ:
 * Хук НЕ импортирует api, store или любые конкретные реализации.
 * Он принимает сервисы через DI (Dependency Injection) —
 * либо аргументом, либо из React Context (см. useProfileSettingsDeps).
 *
 * ПРАВИЛЬНО:  const { ... } = useProfileSettings(deps);
 * НЕПРАВИЛЬНО: import { api } from '@/shared/api';  ← жёсткая связка
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '../../../entities/user';
import type {
    IProfileSettingsService,
    INotificationService,
    I18nService
} from './ports';
import type { ProfileForm, PasswordForm, ValidationErrors, UseProfileSettingsReturn } from './types';
import { validateProfile, validatePasswordForm as validatePwdForm } from '../lib/validation';

/**
 * Получить зависимости из React Context (DI).
 * Composition root (app/providers) пробрасывает реальные реализации.
 */
export { useProfileSettingsDeps } from '../ui/ProfileSettingsContext';

type SetValidationErrors = (errors: ValidationErrors) => void;

/** ─── Данные пользователя и форма редактирования профиля ─── */
const useProfileForm = (
    service: IProfileSettingsService,
    notifier: INotificationService,
    i18n: I18nService,
    setValidationErrors: SetValidationErrors
) => {
    const [user, setUser] = useState<User | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editForm, setEditForm] = useState<ProfileForm>({ username: '', email: '' });
    const [originalForm, setOriginalForm] = useState<ProfileForm>({ username: '', email: '' });

    useEffect(() => {
        service.getCurrentUser()
            .then((userData) => {
                setUser(userData);
                const form: ProfileForm = {
                    username: userData.username ?? '',
                    email: userData.email ?? ''
                };
                setEditForm(form);
                setOriginalForm(form);
            })
            .catch((error: unknown) => {
                console.error('Failed to load user data:', error);
                notifier.notify(i18n.t('notifications.serverDataLoadError'), 'error');
            });
    }, [service, notifier, i18n]);

    const validateProfileForm = useCallback((): boolean => {
        const { errors, isValid } = validateProfile(editForm, i18n);
        setValidationErrors(errors);
        return isValid;
    }, [editForm, i18n, setValidationErrors]);

    const handleEdit = useCallback(() => {
        setShowEditProfile(true);
        setValidationErrors({});
    }, [setValidationErrors]);

    const handleSave = useCallback(async (): Promise<void> => {
        if (!validateProfileForm()) return;

        // Проверяем, изменились ли данные
        if (editForm.username === originalForm.username && editForm.email === originalForm.email) {
            notifier.notify(i18n.t('settingsPage.profile.messages.noChanges'), 'info');
            setShowEditProfile(false);
            return;
        }

        setIsLoading(true);
        try {
            const updatedUser = await service.updateProfile(editForm);
            setUser(updatedUser);
            setOriginalForm(editForm);
            setShowEditProfile(false);
            notifier.notify(i18n.t('settingsPage.profile.messages.profileUpdated'), 'success');
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                i18n.t('settingsPage.profile.messages.updateError');
            notifier.notify(errorMessage, 'error');
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    }, [editForm, originalForm, service, notifier, i18n, validateProfileForm]);

    const handleCancel = useCallback(() => {
        setEditForm(originalForm);
        setShowEditProfile(false);
        setValidationErrors({});
    }, [originalForm, setValidationErrors]);

    return {
        user,
        showEditProfile,
        isLoading,
        editForm,
        setEditForm,
        handleEdit,
        handleSave,
        handleCancel,
        validateProfileForm
    };
};

/** ─── Форма смены пароля ─── */
const usePasswordForm = (
    service: IProfileSettingsService,
    notifier: INotificationService,
    i18n: I18nService,
    setValidationErrors: SetValidationErrors
) => {
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const validatePasswordForm = useCallback((): boolean => {
        const { errors, isValid } = validatePwdForm(passwordForm, i18n);
        setValidationErrors(errors);
        return isValid;
    }, [passwordForm, i18n, setValidationErrors]);

    const handleChangePassword = useCallback(() => {
        setShowPasswordForm(true);
        setValidationErrors({});
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, [setValidationErrors]);

    const handlePasswordSave = useCallback(async (): Promise<void> => {
        if (!validatePasswordForm()) return;

        setIsPasswordLoading(true);
        try {
            await service.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setShowPasswordForm(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            notifier.notify(i18n.t('settingsPage.profile.messages.passwordChanged'), 'success');
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                i18n.t('settingsPage.profile.messages.passwordChangeError');
            notifier.notify(errorMessage, 'error');
            console.error('Error changing password:', error);
        } finally {
            setIsPasswordLoading(false);
        }
    }, [passwordForm, service, notifier, i18n, validatePasswordForm]);

    const handlePasswordCancel = useCallback(() => {
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setValidationErrors({});
    }, [setValidationErrors]);

    return {
        showPasswordForm,
        isPasswordLoading,
        passwordForm,
        setPasswordForm,
        handleChangePassword,
        handlePasswordSave,
        handlePasswordCancel,
        validatePasswordForm
    };
};

/** ─── Подтверждение выхода из аккаунта ─── */
const useLogoutConfirm = (service: IProfileSettingsService) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = useCallback(() => {
        setShowLogoutConfirm(true);
    }, []);

    const confirmLogout = useCallback(() => {
        service.logout();
        setShowLogoutConfirm(false);
    }, [service]);

    const closeLogoutConfirm = useCallback(() => {
        setShowLogoutConfirm(false);
    }, []);

    return { showLogoutConfirm, handleLogout, confirmLogout, closeLogoutConfirm };
};

/**
 * Основной хук. Принимает сервисы через DI.
 *
 * @param service  — реализация IProfileSettingsService
 * @param notifier — реализация INotificationService
 * @param i18n     — реализация I18nService
 */
export const useProfileSettings = (
    service: IProfileSettingsService,
    notifier: INotificationService,
    i18n: I18nService
): UseProfileSettingsReturn => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const profile = useProfileForm(service, notifier, i18n, setValidationErrors);
    const password = usePasswordForm(service, notifier, i18n, setValidationErrors);
    const logout = useLogoutConfirm(service);

    return {
        // Состояния
        user: profile.user,
        showEditProfile: profile.showEditProfile,
        showPasswordForm: password.showPasswordForm,
        showLogoutConfirm: logout.showLogoutConfirm,
        isLoading: profile.isLoading,
        isPasswordLoading: password.isPasswordLoading,
        editForm: profile.editForm,
        passwordForm: password.passwordForm,
        validationErrors,

        // Сеттеры
        setEditForm: profile.setEditForm,
        setPasswordForm: password.setPasswordForm,

        // Обработчики профиля
        handleEdit: profile.handleEdit,
        handleSave: profile.handleSave,
        handleCancel: profile.handleCancel,

        // Обработчики пароля
        handleChangePassword: password.handleChangePassword,
        handlePasswordSave: password.handlePasswordSave,
        handlePasswordCancel: password.handlePasswordCancel,

        // Обработчики выхода
        handleLogout: logout.handleLogout,
        confirmLogout: logout.confirmLogout,
        closeLogoutConfirm: logout.closeLogoutConfirm,

        // Валидация
        validateProfileForm: profile.validateProfileForm,
        validatePasswordForm: password.validatePasswordForm
    };
};
