import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { authStore } from '../../../../store/authStore';
import { ProfileInfoSection, SecuritySection } from '../../features/profile/components';
import { useProfileSettings } from '../../features/profile/hooks';
import './ProfileSettings.scss';

const ProfileSettings: React.FC = observer(() => {
    const { t } = useTranslation();
    const {
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
        confirmLogout
    } = useProfileSettings();

    if (!authStore.user) {
        return null;
    }

    return (
        <div className="profile-settings">
            <div className="settings-section">
                <div className="section-header">
                    <h2>{t('settingsPage.profile.title')}</h2>
                    <p>{t('settingsPage.profile.description')}</p>
                </div>

                <ProfileInfoSection
                    editForm={editForm}
                    setEditForm={setEditForm}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                    showEditProfile={showEditProfile}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                <SecuritySection
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                    showPasswordForm={showPasswordForm}
                    showLogoutConfirm={showLogoutConfirm}
                    isPasswordLoading={isPasswordLoading}
                    onChangePassword={handleChangePassword}
                    onPasswordSave={handlePasswordSave}
                    onPasswordCancel={handlePasswordCancel}
                    onLogout={handleLogout}
                    onConfirmLogout={confirmLogout}
                    onCloseLogoutConfirm={() => setShowLogoutConfirm(false)}
                />
            </div>
        </div>
    );
});

export default ProfileSettings;