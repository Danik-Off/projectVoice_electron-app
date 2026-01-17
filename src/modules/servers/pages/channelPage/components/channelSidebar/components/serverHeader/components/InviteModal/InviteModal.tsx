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

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, serverName, serverIcon, inviteLink, onCopy }) => {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="invite-modal-overlay" onClick={onClose}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <div className="invite-modal__header">
                    <div className="invite-modal__title">
                        <span className="invite-modal__icon">🎉</span>
                        <h3>{t('serverHeader.inviteTitle')}</h3>
                    </div>
                    <button className="invite-modal__close" onClick={onClose}>
                        <span>×</span>
                    </button>
                </div>

                <div className="invite-modal__content">
                    <div className="invite-modal__server-preview">
                        <div className="invite-modal__server-preview-icon">
                            {serverIcon != null && serverIcon !== '' ? (
                                <img src={serverIcon} alt="Server icon" />
                            ) : (
                                <span>{serverName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="invite-modal__server-preview-info">
                            <h4>{serverName}</h4>
                            <p>{t('serverHeader.inviteSubtitle')}</p>
                        </div>
                    </div>

                    <div className="invite-modal__invite-section">
                        <label>{t('serverHeader.inviteLinkLabel')}</label>
                        <div className="invite-modal__link-container">
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="invite-modal__link-input"
                                placeholder={t('serverHeader.inviteLinkPlaceholder')}
                            />
                            <button
                                onClick={onCopy}
                                className="invite-modal__copy-button"
                                title={t('serverHeader.copyLink')}
                            >
                                <span className="invite-modal__copy-icon">📋</span>
                                <span className="invite-modal__copy-text">{t('serverHeader.copy')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="invite-modal__footer">
                        <button onClick={onClose} className="invite-modal__close-button">
                            {t('serverHeader.done')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
