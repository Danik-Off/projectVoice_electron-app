import React from 'react';
import './BlockedServerModal.scss';

interface BlockedServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverName: string;
    reason?: string;
    blockedAt?: string;
    blockedBy?: string;
}

const BlockedServerModal: React.FC<BlockedServerModalProps> = ({
    isOpen,
    onClose,
    serverName,
    reason,
    blockedAt,
    blockedBy
}) => {
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
        <div className="blocked-server-modal-overlay">
            <div className="blocked-server-modal">
                <div className="blocked-server-modal__header">
                    <div className="blocked-server-modal__header-icon">🏠🚫</div>
                    <h2 className="blocked-server-modal__header-title">Сервер заблокирован</h2>
                </div>

                <div className="blocked-server-modal__content">
                    <div className="blocked-server-modal__server-info">
                        <h3 className="blocked-server-modal__server-info-name">
                            Сервер:{' '}
                            <span className="blocked-server-modal__server-info-name--highlighted">{serverName}</span>
                        </h3>
                    </div>

                    <p className="blocked-server-modal__message">Этот сервер был заблокирован администрацией.</p>

                    {reason !== null && reason !== '' ? (
                        <div className="blocked-server-modal__reason-section">
                            <h3 className="blocked-server-modal__reason-section-title">Причина блокировки:</h3>
                            <p className="blocked-server-modal__reason-section-text">{reason}</p>
                        </div>
                    ) : null}

                    {blockedAt !== null && blockedAt !== '' ? (
                        <div className="blocked-server-modal__details-section">
                            <p className="blocked-server-modal__details-section-item">
                                <strong>Дата блокировки:</strong> {formatDate(blockedAt)}
                            </p>
                            {blockedBy !== null && blockedBy !== '' ? (
                                <p className="blocked-server-modal__details-section-item">
                                    <strong>Заблокирован:</strong> {blockedBy}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="blocked-server-modal__contact-info">
                        <p className="blocked-server-modal__contact-info-text">
                            Если вы считаете, что блокировка была применена по ошибке, обратитесь к администрации
                            системы.
                        </p>
                    </div>
                </div>

                <div className="blocked-server-modal__footer">
                    <button className="blocked-server-modal__close-button" onClick={onClose}>
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockedServerModal;
