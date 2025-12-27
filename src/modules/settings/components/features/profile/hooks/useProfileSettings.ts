import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authStore, notificationStore } from '../../../../../../core';
import { userStore } from '../../../../../../modules/auth';
import type { ProfileForm, PasswordForm, ValidationErrors } from '../types';

export const useProfileSettings = () => {
    const { t } = useTranslation();
    
    // Состояния для модальных окон
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // Состояния загрузки
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    
    // Формы
    const [editForm, setEditForm] = useState<ProfileForm>({
        username: authStore.user?.username || '',
        email: authStore.user?.email || ''
    });
    
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [originalForm, setOriginalForm] = useState<ProfileForm>({
        username: authStore.user?.username || '',
        email: authStore.user?.email || ''
    });
    
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    // Обновляем формы при изменении пользователя
    useEffect(() => {
        if (authStore.user) {
            const userData: ProfileForm = {
                username: authStore.user.username || '',
                email: authStore.user.email || ''
            };
            setEditForm(userData);
            setOriginalForm(userData);
        }
    }, [authStore.user]);

    // Валидация формы профиля
    const validateProfileForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!editForm.username.trim()) {
            errors.username = t('settingsPage.profile.validation.usernameRequired');
        } else if (editForm.username.length < 3) {
            errors.username = t('settingsPage.profile.validation.usernameMinLength');
        } else if (editForm.username.length > 20) {
            errors.username = t('settingsPage.profile.validation.usernameMaxLength');
        }

        if (!editForm.email.trim()) {
            errors.email = t('settingsPage.profile.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            errors.email = t('settingsPage.profile.validation.emailInvalid');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Валидация формы пароля
    const validatePasswordForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!passwordForm.currentPassword.trim()) {
            errors.currentPassword = t('settingsPage.profile.validation.currentPasswordRequired');
        }

        if (!passwordForm.newPassword.trim()) {
            errors.newPassword = t('settingsPage.profile.validation.newPasswordRequired');
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = t('settingsPage.profile.validation.passwordMinLength');
        } else if (passwordForm.newPassword.length > 50) {
            errors.newPassword = t('settingsPage.profile.validation.passwordMaxLength');
        }

        if (!passwordForm.confirmPassword.trim()) {
            errors.confirmPassword = t('settingsPage.profile.validation.confirmPasswordRequired');
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = t('settingsPage.profile.validation.passwordsDoNotMatch');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Обработчики для профиля
    const handleEdit = () => {
        setShowEditProfile(true);
        setValidationErrors({});
    };

    const handleSave = async () => {
        if (!validateProfileForm()) {
            return;
        }

        // Проверяем, изменились ли данные
        if (editForm.username === originalForm.username && editForm.email === originalForm.email) {
            notificationStore.addNotification(t('settingsPage.profile.messages.noChanges'), 'info');
            setShowEditProfile(false);
            return;
        }

        setIsLoading(true);
        try {
            if (authStore.user?.id) {
                await userStore.updateProfile(editForm);
                setOriginalForm(editForm);
                setShowEditProfile(false);
                notificationStore.addNotification(t('settingsPage.profile.messages.profileUpdated'), 'success');
            }
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('settingsPage.profile.messages.updateError');
            notificationStore.addNotification(errorMessage, 'error');
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditForm(originalForm);
        setShowEditProfile(false);
        setValidationErrors({});
    };

    // Обработчики для пароля
    const handleChangePassword = () => {
        setShowPasswordForm(true);
        setValidationErrors({});
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handlePasswordSave = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        setIsPasswordLoading(true);
        try {
            if (authStore.user?.id) {
                await userStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                setShowPasswordForm(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                notificationStore.addNotification(t('settingsPage.profile.messages.passwordChanged'), 'success');
            }
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('settingsPage.profile.messages.passwordChangeError');
            notificationStore.addNotification(errorMessage, 'error');
            console.error('Error changing password:', error);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handlePasswordCancel = () => {
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setValidationErrors({});
    };

    // Обработчики для выхода
    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        authStore.logout();
        setShowLogoutConfirm(false);
    };

    return {
        // Состояния
        showEditProfile,
        showPasswordForm,
        showLogoutConfirm,
        isLoading,
        isPasswordLoading,
        editForm,
        passwordForm,
        validationErrors,
        
        // Сеттеры
        setEditForm,
        setPasswordForm,
        setValidationErrors,
        setShowLogoutConfirm,
        
        // Обработчики
        handleEdit,
        handleSave,
        handleCancel,
        handleChangePassword,
        handlePasswordSave,
        handlePasswordCancel,
        handleLogout,
        confirmLogout,
        
        // Валидация
        validateProfileForm,
        validatePasswordForm
    };
};
