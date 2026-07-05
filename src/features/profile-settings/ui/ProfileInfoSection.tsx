/**
 * ProfileInfoSection — чисто презентационный компонент.
 *
 * НЕ импортирует authStore, apiClient, localStorage или любые сервисы.
 * Все данные и колбэки получает через props.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared';
import type { User } from '../../../entities/user';
import type { ProfileForm, ValidationErrors } from '../model/types';
import './ProfileInfoSection.scss';

interface ProfileInfoSectionProps {
    user: User | null;
    editForm: ProfileForm;
    validationErrors: ValidationErrors;
    showEditProfile: boolean;
    isLoading: boolean;
    onFieldChange: (field: keyof ProfileForm, value: string) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

/* eslint-disable max-lines-per-function -- Complex profile info component */
const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
    user,
    editForm,
    validationErrors,
    showEditProfile,
    isLoading,
    onFieldChange,
    onEdit,
    onSave,
    onCancel
}) => {
    const { t } = useTranslation();

    if (user === null) {
        return null;
    }

    return (
        <>
            {/* Основная информация профиля */}
            <div className="settings-card">
                <div className="card-header">
                    <div className="header-content">
                        <div className="icon-container">👤</div>
                        <div className="header-text">
                            <h3>{t('settingsPage.profile.basicInfo.title')}</h3>
                            <p>{t('settingsPage.profile.basicInfo.description')}</p>
                        </div>
                    </div>
                </div>

                <div className="card-content">
                    <div className="profile-info-section">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {user.profilePicture != null && user.profilePicture.length > 0 ? (
                                    <img src={user.profilePicture} alt={user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-fields">
                            <div className="setting-group">
                                <div className="setting-header">
                                    <label className="setting-label">
                                        {t('settingsPage.profile.basicInfo.username')}
                                    </label>
                                </div>
                                <div className="setting-control">
                                    <div className="info-display">{user.username}</div>
                                </div>
                            </div>

                            <div className="setting-group">
                                <div className="setting-header">
                                    <label className="setting-label">{t('common.email')}</label>
                                </div>
                                <div className="setting-control">
                                    <div className="info-display">{user.email}</div>
                                </div>
                            </div>

                            <div className="setting-group">
                                <div className="setting-header">
                                    <label className="setting-label">
                                        {t('settingsPage.profile.basicInfo.role')}
                                    </label>
                                </div>
                                <div className="setting-control">
                                    <div className="info-display role-display">
                                        <span className="role-badge">{user.role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="btn-edit" onClick={onEdit} disabled={isLoading}>
                                {t('common.edit')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно редактирования профиля */}
            <Modal
                isOpen={showEditProfile}
                onClose={onCancel}
                title={t('settingsPage.profile.basicInfo.title')}
                size="medium"
                icon="👤"
                closeOnOverlayClick={!isLoading}
            >
                <div className="profile-edit-form">
                    <div className="setting-group">
                        <label className="setting-label">{t('settingsPage.profile.basicInfo.username')}</label>
                        <div className="input-container">
                            <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => onFieldChange('username', e.target.value)}
                                className={`edit-input ${validationErrors.username != null ? 'error' : ''}`}
                                placeholder={t('settingsPage.profile.basicInfo.usernamePlaceholder')}
                                disabled={isLoading}
                            />
                            {validationErrors.username != null ? (
                                <div className="error-message">{validationErrors.username}</div>
                            ) : null}
                        </div>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">{t('common.email')}</label>
                        <div className="input-container">
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => onFieldChange('email', e.target.value)}
                                className={`edit-input ${validationErrors.email != null ? 'error' : ''}`}
                                placeholder={t('settingsPage.profile.basicInfo.emailPlaceholder')}
                                disabled={isLoading}
                            />
                            {validationErrors.email != null ? (
                                <div className="error-message">{validationErrors.email}</div>
                            ) : null}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-save" onClick={onSave} disabled={isLoading}>
                            {isLoading ? <span className="loading-spinner">⏳</span> : t('common.save')}
                        </button>
                        <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ProfileInfoSection;
