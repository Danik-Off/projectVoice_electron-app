import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { connectionStore } from '../core/store/ConnectionStore';
import './NoConnectionModal.scss';

const NoConnectionModal: React.FC = observer(() => {
    const { t } = useTranslation();
    const [newUrl, setNewUrl] = useState(connectionStore.serverUrl);
    const [isEditing, setIsEditing] = useState(connectionStore.isSettingsModalOpen);

    const isOpen = !connectionStore.isConnected || connectionStore.isSettingsModalOpen;

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        if (newUrl.trim()) {
            connectionStore.setServerUrl(newUrl.trim());
        }
    };

    const handleClose = () => {
        if (connectionStore.isSettingsModalOpen) {
            connectionStore.setSettingsModalOpen(false);
            setIsEditing(false);
        } else {
            setIsEditing(false);
        }
    };

    const isManualSettings = connectionStore.isSettingsModalOpen && connectionStore.isConnected;

    return (
        <div className="no-connection-modal-overlay" onClick={handleClose}>
            <div className="no-connection-modal" onClick={(e) => e.stopPropagation()}>
                <div
                    className="no-connection-modal__header"
                    style={
                        isManualSettings
                            ? {
                                  background:
                                      'linear-gradient(135deg, var(--success-accent) 0%, var(--tertiary-accent) 100%)'
                              }
                            : {}
                    }
                >
                    <div className="no-connection-modal__header-icon">🔌</div>
                    <h2 className="no-connection-modal__header-title">
                        {isManualSettings ? t('connection.serverSettings') : t('connection.noConnection')}
                    </h2>
                </div>

                <div className="no-connection-modal__content">
                    <p className="no-connection-modal__message">
                        {isManualSettings
                            ? t('connection.serverSettingsDescription')
                            : t('connection.noConnectionDescription')}
                    </p>

                    <div className="no-connection-modal__current-server">
                        <span className="no-connection-modal__current-server-label">
                            {t('connection.currentAddress')}
                        </span>
                        <code className="no-connection-modal__current-server-url">{connectionStore.serverUrl}</code>
                    </div>

                    {!isEditing ? (
                        <button className="no-connection-modal__edit-button" onClick={() => setIsEditing(true)}>
                            {t('connection.editAddress')}
                        </button>
                    ) : (
                        <div className="no-connection-modal__edit-section">
                            <label htmlFor="server-url">{t('connection.newAddress')}</label>
                            <input
                                id="server-url"
                                type="text"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder={t('connection.placeholder')}
                                className="no-connection-modal__edit-section-input"
                                autoFocus
                            />
                            <div className="no-connection-modal__edit-section-button-group">
                                <button
                                    className="no-connection-modal__edit-section-button-group-save-button"
                                    onClick={handleSave}
                                >
                                    {t('connection.saveAndRestart')}
                                </button>
                                <button
                                    className="no-connection-modal__edit-section-button-group-cancel-button"
                                    onClick={handleClose}
                                >
                                    {t('connection.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!isManualSettings && (
                    <div className="no-connection-modal__footer">
                        <div className="no-connection-modal__retry-status">
                            <span className="no-connection-modal__retry-status-spinner" />
                            {t('connection.retryStatus')}
                        </div>
                    </div>
                )}

                {isManualSettings && !isEditing ? (
                    <div className="no-connection-modal__footer">
                        <button
                            className="no-connection-modal__edit-section-button-group-cancel-button"
                            style={{ width: '100%' }}
                            onClick={handleClose}
                        >
                            {t('connection.close')}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
});

export default NoConnectionModal;
