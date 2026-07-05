/**
 * ProfileSettings — контейнерный компонент (Composition Root для фичи).
 *
 * Получает сервисы из DI-контекста, вызывает хук useProfileSettings
 * и передаёт состояние/действия в презентационные компоненты через props.
 *
 * Здесь НЕТ прямых импортов api, store или localStorage.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileSettings } from '../model/useProfileSettings';
import { useProfileSettingsDeps } from './ProfileSettingsContext';
import ProfileInfoSection from './ProfileInfoSection';
import SecuritySection from './SecuritySection';
import type { ProfileForm, PasswordForm } from '../model/types';
import './ProfileSettings.scss';

const ProfileSettings: React.FC = () => {
    const { t } = useTranslation();

    // ─── DI: достаём реализации сервисов из контекста ───
    const { profileSettingsService, notificationService } = useProfileSettingsDeps();

    // i18n адаптер — оборачиваем useTranslation в I18nService
    const i18nService = React.useMemo(
        () => ({ t: (key: string) => t(key) }),
        [t]
    );

    // ─── Хук принимает сервисы через DI (инверсия зависимостей) ───
    const {
        user,
        showEditProfile,
        showPasswordForm,
        showLogoutConfirm,
        isLoading,
        isPasswordLoading,
        editForm,
        passwordForm,
        validationErrors,
        setEditForm,
        setPasswordForm,
        handleEdit,
        handleSave,
        handleCancel,
        handleChangePassword,
        handlePasswordSave,
        handlePasswordCancel,
        handleLogout,
        confirmLogout,
        closeLogoutConfirm
    } = useProfileSettings(profileSettingsService, notificationService, i18nService);

    // ─── Адаптеры для полей форм (чистые колбэки для UI) ───
    const handleFieldChange = useCallback(
        (field: keyof ProfileForm, value: string) => {
            setEditForm({ ...editForm, [field]: value });
        },
        [editForm, setEditForm]
    );

    const handlePasswordFieldChange = useCallback(
        (field: keyof PasswordForm, value: string) => {
            setPasswordForm({ ...passwordForm, [field]: value });
        },
        [passwordForm, setPasswordForm]
    );

    // ─── Загрузка ───
    if (user === null) {
        return (
            <div className="profile-settings">
                <div className="settings-section">
                    <div className="section-header">
                        <h2>{t('settingsPage.profile.title')}</h2>
                        <p>Загрузка данных профиля...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-settings">
            <div className="settings-section">
                <div className="section-header">
                    <h2>{t('settingsPage.profile.title')}</h2>
                    <p>{t('settingsPage.profile.description')}</p>
                </div>

                <ProfileInfoSection
                    user={user}
                    editForm={editForm}
                    validationErrors={validationErrors}
                    showEditProfile={showEditProfile}
                    isLoading={isLoading}
                    onFieldChange={handleFieldChange}
                    onEdit={handleEdit}
                    onSave={() => {
                        handleSave().catch((error: unknown) => {
                            console.error('Error saving profile:', error);
                        });
                    }}
                    onCancel={handleCancel}
                />

                <SecuritySection
                    passwordForm={passwordForm}
                    validationErrors={validationErrors}
                    showPasswordForm={showPasswordForm}
                    showLogoutConfirm={showLogoutConfirm}
                    isPasswordLoading={isPasswordLoading}
                    onFieldChange={handlePasswordFieldChange}
                    onChangePassword={handleChangePassword}
                    onPasswordSave={() => {
                        handlePasswordSave().catch((error: unknown) => {
                            console.error('Error saving password:', error);
                        });
                    }}
                    onPasswordCancel={handlePasswordCancel}
                    onLogout={handleLogout}
                    onConfirmLogout={confirmLogout}
                    onCloseLogoutConfirm={closeLogoutConfirm}
                />
            </div>
        </div>
    );
};

export default ProfileSettings;
