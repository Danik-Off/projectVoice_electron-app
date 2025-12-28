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

    if (!isOpen) return null;

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
            <div className="no-connection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={isManualSettings ? { background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' } : {}}>
                    <div className="icon">🔌</div>
                    <h2>{isManualSettings ? t('connection.serverSettings') : t('connection.noConnection')}</h2>
                </div>
                
                <div className="modal-content">
                    <p className="message">
                        {isManualSettings 
                            ? t('connection.serverSettingsDescription')
                            : t('connection.noConnectionDescription')}
                    </p>

                    <div className="current-server">
                        <span className="label">{t('connection.currentAddress')}</span>
                        <code className="url">{connectionStore.serverUrl}</code>
                    </div>

                    {!isEditing ? (
                        <button 
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            {t('connection.editAddress')}
                        </button>
                    ) : (
                        <div className="edit-section">
                            <label htmlFor="server-url">{t('connection.newAddress')}</label>
                            <input 
                                id="server-url"
                                type="text" 
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder={t('connection.placeholder')}
                                className="server-input"
                                autoFocus
                            />
                            <div className="button-group">
                                <button className="save-button" onClick={handleSave}>
                                    {t('connection.saveAndRestart')}
                                </button>
                                <button className="cancel-button" onClick={handleClose}>
                                    {t('connection.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {!isManualSettings && (
                    <div className="modal-footer">
                        <div className="retry-status">
                            <span className="spinner"></span>
                            {t('connection.retryStatus')}
                        </div>
                    </div>
                )}

                {isManualSettings && !isEditing && (
                    <div className="modal-footer">
                        <button className="cancel-button" style={{ width: '100%' }} onClick={handleClose}>
                            {t('connection.close')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default NoConnectionModal;

