/**
 * ConnectionModal - чисто презентационный компонент.
 *
 * НЕ импортирует connectionStore, apiClient или любые сервисы.
 * Все данные и колбэки получает через props.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConnectionStatus, RetryInfo } from '../../../entities/connection';
import './ConnectionModal.scss';

interface ConnectionModalProps {
    /** Текущий статус подключения */
    status: ConnectionStatus;

    /** URL сервера */
    serverUrl: string;

    /** Информация о попытках переподключения */
    retryInfo: RetryInfo | null;

    /** Открыта ли модалка вручную (через настройки) */
    isManualSettings: boolean;

    /** Режим редактирования URL */
    isEditing: boolean;

    /** Поле ввода нового URL */
    newUrl: string;

    /** Ошибка валидации URL */
    urlError: string | null;

    /** Сохраняется ли URL */
    isSaving: boolean;

    // Колбэки
    onClose: () => void;
    onStartEditing: () => void;
    onSaveUrl: () => void;
    onCancelEditing: () => void;
    onNewUrlChange: (url: string) => void;
    onRetryNow: () => void;
}

/* eslint-disable max-lines-per-function */
const ConnectionModal: React.FC<ConnectionModalProps> = ({
    status,
    serverUrl,
    retryInfo,
    isManualSettings,
    isEditing,
    newUrl,
    urlError,
    isSaving,
    onClose,
    onStartEditing,
    onSaveUrl,
    onCancelEditing,
    onNewUrlChange,
    onRetryNow
}) => {
    const { t } = useTranslation();

    const isDisconnected = status === 'disconnected';
    const isReconnecting = status === 'reconnecting';
    const showRetry = isDisconnected || isReconnecting;

    const statusDotClass =
        status === 'connected'
            ? 'connection-modal__status-indicator-dot--connected'
            : status === 'reconnecting'
              ? 'connection-modal__status-indicator-dot--reconnecting'
              : 'connection-modal__status-indicator-dot--disconnected';

    return (
        <div className="connection-modal-overlay" onClick={onClose}>
            <div
                className={`connection-modal ${isManualSettings ? 'connection-modal--settings' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок */}
                <div className="connection-modal__header">
                    <div className="connection-modal__header-icon">
                        {isManualSettings ? '⚙️' : '🔌'}
                    </div>
                    <h2 className="connection-modal__header-title">
                        {isManualSettings
                            ? t('connection.serverSettings')
                            : t('connection.noConnection')}
                    </h2>
                    <div className="connection-modal__status-indicator">
                        <span className={`connection-modal__status-indicator-dot ${statusDotClass}`} />
                        {status === 'connected' && t('connection.statusConnected')}
                        {status === 'disconnected' && t('connection.statusDisconnected')}
                        {status === 'reconnecting' && t('connection.statusReconnecting')}
                        {status === 'connecting' && t('connection.statusConnecting')}
                    </div>
                </div>

                {/* Контент */}
                <div className="connection-modal__content">
                    <p className="connection-modal__message">
                        {isManualSettings
                            ? t('connection.serverSettingsDescription')
                            : t('connection.noConnectionDescription')}
                    </p>

                    {/* Текущий адрес сервера */}
                    <div className="connection-modal__current-server">
                        <span className="connection-modal__current-server-label">
                            {t('connection.currentAddress')}
                        </span>
                        <code className="connection-modal__current-server-url">{serverUrl}</code>
                    </div>

                    {/* Редактирование URL */}
                    {!isEditing ? (
                        <button
                            className="connection-modal__edit-button"
                            onClick={onStartEditing}
                        >
                            {t('connection.editAddress')}
                        </button>
                    ) : (
                        <div className="connection-modal__edit-section">
                            <label htmlFor="server-url">{t('connection.newAddress')}</label>
                            <input
                                id="server-url"
                                type="text"
                                value={newUrl}
                                onChange={(e) => onNewUrlChange(e.target.value)}
                                placeholder={t('connection.placeholder')}
                                className={`connection-modal__edit-section-input ${urlError !== null ? 'connection-modal__edit-section-input--error' : ''}`}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isSaving) {
                                        onSaveUrl();
                                    }
                                }}
                            />
                            {urlError !== null && (
                                <div className="connection-modal__edit-section-error">{urlError}</div>
                            )}
                            <div className="connection-modal__edit-section-button-group">
                                <button
                                    className="connection-modal__edit-section-button-group-save-button"
                                    onClick={onSaveUrl}
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? t('connection.saving')
                                        : t('connection.saveAndRestart')}
                                </button>
                                <button
                                    className="connection-modal__edit-section-button-group-cancel-button"
                                    onClick={onCancelEditing}
                                >
                                    {t('connection.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Футер */}
                <div className="connection-modal__footer">
                    {/* Автоматические ретраи при отсутствии подключения */}
                    {showRetry && !isManualSettings && (
                        <div className="connection-modal__retry-section">
                            {isReconnecting && retryInfo !== null && (
                                <div className="connection-modal__retry-status">
                                    <span className="connection-modal__spinner" />
                                    {t('connection.retryStatus')}
                                </div>
                            )}
                            {retryInfo !== null && retryInfo.nextRetryIn > 0 && (
                                <div className="connection-modal__retry-timer">
                                    {t('connection.nextRetryIn')}{' '}
                                    <span className="connection-modal__retry-timer-count">
                                        {retryInfo.nextRetryIn}s
                                    </span>
                                </div>
                            )}
                            <button
                                className="connection-modal__retry-button"
                                onClick={onRetryNow}
                                disabled={isReconnecting}
                            >
                                🔄 {t('connection.retryNow')}
                            </button>
                        </div>
                    )}

                    {/* Кнопка закрытия для ручных настроек */}
                    {isManualSettings && !isEditing && (
                        <button
                            className="connection-modal__close-button"
                            onClick={onClose}
                        >
                            {t('connection.close')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionModal;
