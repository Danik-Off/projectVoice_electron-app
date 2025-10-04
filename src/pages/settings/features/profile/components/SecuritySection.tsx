import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../../components/ui';
import type { PasswordForm, ValidationErrors } from '../types';
import './SecuritySection.scss';

interface SecuritySectionProps {
    passwordForm: PasswordForm;
    setPasswordForm: (form: PasswordForm) => void;
    validationErrors: ValidationErrors;
    setValidationErrors: (errors: ValidationErrors) => void;
    showPasswordForm: boolean;
    showLogoutConfirm: boolean;
    isPasswordLoading: boolean;
    onChangePassword: () => void;
    onPasswordSave: () => void;
    onPasswordCancel: () => void;
    onLogout: () => void;
    onConfirmLogout: () => void;
    onCloseLogoutConfirm: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = observer(({
    passwordForm,
    setPasswordForm,
    validationErrors,
    setValidationErrors,
    showPasswordForm,
    showLogoutConfirm,
    isPasswordLoading,
    onChangePassword,
    onPasswordSave,
    onPasswordCancel,
    onLogout,
    onConfirmLogout,
    onCloseLogoutConfirm
}) => {
    const { t } = useTranslation();

    const handlePasswordFieldChange = (field: keyof PasswordForm, value: string) => {
        setPasswordForm({ ...passwordForm, [field]: value });
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: undefined });
        }
    };

    return (
        <>
            {/* Безопасность */}
            <div className="settings-card">
                <div className="card-header">
                    <div className="header-content">
                        <div className="icon-container">
                            🔒
                        </div>
                        <div className="header-text">
                            <h3>{t('settingsPage.profile.security.title')}</h3>
                            <p>{t('settingsPage.profile.security.description')}</p>
                        </div>
                    </div>
                </div>
                
                <div className="card-content">
                    <div className="setting-group">
                        <div className="setting-header">
                            <label className="setting-label">
                                {t('common.password')}
                            </label>
                        </div>
                        <div className="setting-control">
                            <button 
                                className="btn-change-password" 
                                onClick={onChangePassword}
                                disabled={isPasswordLoading}
                            >
                                {t('settingsPage.profile.security.changePassword')}
                            </button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <div className="setting-header">
                            <label className="setting-label">
                                {t('settingsPage.profile.security.logout')}
                            </label>
                        </div>
                        <div className="setting-control">
                            <button 
                                className="btn-logout" 
                                onClick={onLogout}
                                disabled={isPasswordLoading}
                            >
                                {t('settingsPage.profile.security.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно изменения пароля */}
            <Modal
                isOpen={showPasswordForm}
                onClose={onPasswordCancel}
                title={t('settingsPage.profile.security.changePassword')}
                size="medium"
                icon="🔒"
                closeOnOverlayClick={!isPasswordLoading}
            >
                <div className="password-form">
                    <div className="setting-group">
                        <label className="setting-label">
                            {t('settingsPage.profile.security.currentPassword')}
                        </label>
                        <div className="input-container">
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                                className={`password-input ${validationErrors.currentPassword ? 'error' : ''}`}
                                placeholder={t('settingsPage.profile.security.currentPasswordPlaceholder')}
                                disabled={isPasswordLoading}
                            />
                            {validationErrors.currentPassword && (
                                <div className="error-message">{validationErrors.currentPassword}</div>
                            )}
                        </div>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            {t('settingsPage.profile.security.newPassword')}
                        </label>
                        <div className="input-container">
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                                className={`password-input ${validationErrors.newPassword ? 'error' : ''}`}
                                placeholder={t('settingsPage.profile.security.newPasswordPlaceholder')}
                                disabled={isPasswordLoading}
                            />
                            {validationErrors.newPassword && (
                                <div className="error-message">{validationErrors.newPassword}</div>
                            )}
                        </div>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            {t('settingsPage.profile.security.confirmPassword')}
                        </label>
                        <div className="input-container">
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                                className={`password-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                                placeholder={t('settingsPage.profile.security.confirmPasswordPlaceholder')}
                                disabled={isPasswordLoading}
                            />
                            {validationErrors.confirmPassword && (
                                <div className="error-message">{validationErrors.confirmPassword}</div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button 
                            className="btn-save" 
                            onClick={onPasswordSave}
                            disabled={isPasswordLoading}
                        >
                            {isPasswordLoading ? (
                                <span className="loading-spinner">⏳</span>
                            ) : (
                                t('common.save')
                            )}
                        </button>
                        <button 
                            className="btn-cancel" 
                            onClick={onPasswordCancel}
                            disabled={isPasswordLoading}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Модальное окно подтверждения выхода */}
            <Modal
                isOpen={showLogoutConfirm}
                onClose={onCloseLogoutConfirm}
                title={t('settingsPage.profile.security.logoutConfirmTitle')}
                size="small"
                icon="⚠️"
            >
                <div className="logout-confirm">
                    <p className="logout-message">
                        {t('settingsPage.profile.security.logoutConfirmMessage')}
                    </p>
                    
                    <div className="modal-actions">
                        <button 
                            className="btn-logout" 
                            onClick={onConfirmLogout}
                        >
                            {t('settingsPage.profile.security.confirmLogout')}
                        </button>
                        <button 
                            className="btn-cancel" 
                            onClick={onCloseLogoutConfirm}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
});

export default SecuritySection;
