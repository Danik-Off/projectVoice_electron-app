import React, { useState } from 'react';
import { Modal } from '../../../../../../shared';
import serverStore from '../../../../store/serverStore';
import { notificationStore } from '../../../../../../core';
import './CreateServerModal.scss';

interface CreateServerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateServerModal: React.FC<CreateServerModalProps> = ({ isOpen, onClose }) => {
    const [serverName, setServerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Будущий функционал (заложен на будущее)
    const [isPrivate, setIsPrivate] = useState(false);
    const [requireVerification, setRequireVerification] = useState(false);
    const [allowInvites, setAllowInvites] = useState(true);

    const handleCreateServer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!serverName.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            await serverStore.createServer({
                name: serverName.trim(),
                isPrivate,
                requireVerification,
                allowInvites
            });

            setServerName('');
            setIsPrivate(false);
            setRequireVerification(false);
            setAllowInvites(true);
            onClose();

            notificationStore.addNotification('Сервер создан успешно!', 'success');
        } catch (error) {
            console.error('Ошибка создания сервера:', error);
            notificationStore.addNotification('Ошибка создания сервера', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setServerName('');
            setIsPrivate(false);
            setRequireVerification(false);
            setAllowInvites(true);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Создать сервер" size="small" icon="➕">
            <form className="create-server-form" onSubmit={handleCreateServer}>
                <div className="create-server-form__field">
                    <label className="create-server-form__label">
                        Название сервера
                        <span className="create-server-form__required">*</span>
                    </label>
                    <input
                        className="create-server-form__input"
                        type="text"
                        placeholder="Введите название сервера"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        disabled={isLoading}
                        required
                        maxLength={50}
                        autoFocus
                    />
                </div>

                {/* Будущий функционал - скрыт, но готов к использованию */}
                <div className="create-server-form__future-features" style={{ display: 'none' }}>
                    <div className="create-server-form__field">
                        <label className="create-server-form__checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span>Приватный сервер</span>
                        </label>
                    </div>

                    <div className="create-server-form__field">
                        <label className="create-server-form__checkbox-label">
                            <input
                                type="checkbox"
                                checked={requireVerification}
                                onChange={(e) => setRequireVerification(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span>Требовать верификацию</span>
                        </label>
                    </div>

                    <div className="create-server-form__field">
                        <label className="create-server-form__checkbox-label">
                            <input
                                type="checkbox"
                                checked={allowInvites}
                                onChange={(e) => setAllowInvites(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span>Разрешить приглашения</span>
                        </label>
                    </div>
                </div>

                <div className="create-server-form__actions">
                    <button
                        type="button"
                        className="create-server-form__button create-server-form__button--secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="create-server-form__button create-server-form__button--primary"
                        disabled={!serverName.trim() || isLoading}
                    >
                        {isLoading ? 'Создание...' : 'Создать'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateServerModal;
