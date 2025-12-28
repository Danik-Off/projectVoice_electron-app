import React from 'react';
import { useTranslation } from 'react-i18next';
import './InviteModal.scss';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverName: string;
    serverIcon?: string;
    inviteLink: string;
    onCopy: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
    isOpen,
    onClose,
    serverName,
    serverIcon,
    inviteLink,
    onCopy
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="invite-modal-overlay" onClick={onClose}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="modal-icon">🎉</span>
                        <h3>{t('serverHeader.inviteTitle')}</h3>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <span>×</span>
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="server-preview">
                        <div className="server-preview-icon">
                            {serverIcon ? (
                                <img src={serverIcon} alt="Server icon" />
                            ) : (
                                <span>{serverName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="server-preview-info">
                            <h4>{serverName}</h4>
                            <p>{t('serverHeader.inviteSubtitle')}</p>
                        </div>
                    </div>
                    
                    <div className="invite-section">
                        <label>{t('serverHeader.inviteLinkLabel')}</label>
                        <div className="invite-link-container">
                            <input 
                                type="text" 
                                value={inviteLink} 
                                readOnly 
                                className="invite-link-input"
                                placeholder={t('serverHeader.inviteLinkPlaceholder')}
                            />
                            <button 
                                onClick={onCopy} 
                                className="copy-button"
                                title={t('serverHeader.copyLink')}
                            >
                                <span className="copy-icon">📋</span>
                                <span className="copy-text">{t('serverHeader.copy')}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button onClick={onClose} className="close-button">
                            {t('serverHeader.done')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;

