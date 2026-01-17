import React from 'react';
import './BlockedAccountModal.scss';

interface BlockedAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason?: string;
    blockedAt?: string;
    blockedBy?: string;
}

const BlockedAccountModal: React.FC<BlockedAccountModalProps> = ({ isOpen, onClose, reason, blockedAt, blockedBy }) => {
    if (!isOpen) {
        return null;
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    return (
        <div className="blocked-account-modal-overlay">
            <div className="blocked-account-modal">
                <div className="blocked-account-modal__header">
                    <div className="blocked-account-modal__header-icon">🚫</div>
                    <h2 className="blocked-account-modal__header-title">Аккаунт заблокирован</h2>
                </div>

                <div className="blocked-account-modal__content">
                    <p className="blocked-account-modal__message">Ваш аккаунт был заблокирован администрацией.</p>

                    {reason !== null && reason !== '' ? (
                        <div className="blocked-account-modal__reason-section">
                            <h3 className="blocked-account-modal__reason-section-title">Причина блокировки:</h3>
                            <p className="blocked-account-modal__reason-section-text">{reason}</p>
                        </div>
                    ) : null}

                    {blockedAt !== null && blockedAt !== '' ? (
                        <div className="blocked-account-modal__details-section">
                            <p className="blocked-account-modal__details-section-item">
                                <strong>Дата блокировки:</strong> {formatDate(blockedAt)}
                            </p>
                            {blockedBy !== null && blockedBy !== '' ? (
                                <p className="blocked-account-modal__details-section-item">
                                    <strong>Заблокирован:</strong> {blockedBy}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="blocked-account-modal__contact-info">
                        <p className="blocked-account-modal__contact-info-text">
                            Если вы считаете, что блокировка была применена по ошибке, обратитесь к администрации
                            системы.
                        </p>
                    </div>
                </div>

                <div className="blocked-account-modal__footer">
                    <button className="blocked-account-modal__close-button" onClick={onClose}>
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockedAccountModal;
