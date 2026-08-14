/**
 * ConnectionModal - чисто презентационный компонент.
 *
 * НЕ импортирует connectionStore, apiClient или любые сервисы.
 * Все данные и колбэки получает через props.
 *
 * Построен поверх общего shared/components/Modal - для визуальной консистентности
 * с остальными модалками приложения (та же анимация, Escape, блокировка скролла).
 */

import React from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import Modal from '../../../shared/components/Modal';
import type { ConnectionStatus, RetryInfo } from '../model/types';
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

const STATUS_DOT_MODIFIER_BY_STATUS: Record<ConnectionStatus, string> = {
    connected: 'connection-status__dot--connected',
    reconnecting: 'connection-status__dot--reconnecting',
    connecting: 'connection-status__dot--disconnected',
    disconnected: 'connection-status__dot--disconnected'
};

const STATUS_TEXT_KEY_BY_STATUS: Record<ConnectionStatus, string> = {
    connected: 'connection.statusConnected',
    disconnected: 'connection.statusDisconnected',
    reconnecting: 'connection.statusReconnecting',
    connecting: 'connection.statusConnecting'
};

const StatusBadge: React.FC<{ status: ConnectionStatus; t: TFunction }> = ({ status: connectionStatus, t }) => (
    <span className="connection-status">
        <span className={`connection-status__dot ${STATUS_DOT_MODIFIER_BY_STATUS[connectionStatus]}`} />
        {t(STATUS_TEXT_KEY_BY_STATUS[connectionStatus])}
    </span>
);

interface EditSectionProps {
    newUrl: string;
    urlError: string | null;
    isSaving: boolean;
    onNewUrlChange: (url: string) => void;
    onSaveUrl: () => void;
    onCancelEditing: () => void;
    t: TFunction;
}

const EditSection: React.FC<EditSectionProps> = ({
    newUrl,
    urlError,
    isSaving,
    onNewUrlChange,
    onSaveUrl,
    onCancelEditing,
    t
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            onSaveUrl();
        }
    };

    return (
        <div className="setting-group">
            <div className="setting-header">
                <label className="setting-label" htmlFor="connection-server-url">
                    {t('connection.newAddress')}
                </label>
            </div>
            <div className="setting-control">
                <input
                    id="connection-server-url"
                    type="text"
                    value={newUrl}
                    onChange={(e) => onNewUrlChange(e.target.value)}
                    placeholder={t('connection.placeholder')}
                    className={`settings-input ${urlError !== null ? 'connection-modal__input--error' : ''}`}
                    autoFocus
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                />
                {urlError !== null ? <div className="connection-modal__error">{urlError}</div> : null}
                <div className="settings-grid two-columns connection-modal__actions">
                    <button className="settings-button" onClick={onSaveUrl} disabled={isSaving}>
                        {isSaving ? t('connection.saving') : t('connection.saveAndRestart')}
                    </button>
                    <button className="settings-button secondary" onClick={onCancelEditing} disabled={isSaving}>
                        {t('connection.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface RetryBlockProps {
    isReconnecting: boolean;
    retryInfo: RetryInfo | null;
    onRetryNow: () => void;
    t: TFunction;
}

const RetryBlock: React.FC<RetryBlockProps> = ({ isReconnecting, retryInfo, onRetryNow, t }) => (
    <div className="connection-retry">
        {isReconnecting ? (
            <div className="connection-retry__status">
                <span className="connection-retry__spinner" />
                <span>{t('connection.retryStatus')}</span>
                {retryInfo !== null && retryInfo.nextRetryIn > 0 ? (
                    <span className="connection-retry__timer">
                        {t('connection.nextRetryIn')} {retryInfo.nextRetryIn}s
                    </span>
                ) : null}
            </div>
        ) : null}
        <button className="settings-button connection-retry__button" onClick={onRetryNow} disabled={isReconnecting}>
            🔄 {t('connection.retryNow')}
        </button>
    </div>
);

const ConnectionModal: React.FC<ConnectionModalProps> = ({
    status: connectionStatus,
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

    const showRetry = (connectionStatus === 'disconnected' || connectionStatus === 'reconnecting') && !isManualSettings;

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={isManualSettings ? t('connection.serverSettings') : t('connection.noConnection')}
            icon={isManualSettings ? '⚙️' : '🔌'}
            size="small"
            showCloseButton={isManualSettings}
            closeOnOverlayClick={isManualSettings}
            className="connection-modal"
        >
            <StatusBadge status={connectionStatus} t={t} />

            <p className="connection-modal__message">
                {isManualSettings ? t('connection.serverSettingsDescription') : t('connection.noConnectionDescription')}
            </p>

            <div className="settings-card">
                <div className="card-content">
                    <div className="setting-group">
                        <div className="setting-header">
                            <label className="setting-label">{t('connection.currentAddress')}</label>
                        </div>
                        <div className="setting-control">
                            <code className="connection-modal__url">{serverUrl}</code>
                        </div>
                    </div>

                    {isEditing ? (
                        <EditSection
                            newUrl={newUrl}
                            urlError={urlError}
                            isSaving={isSaving}
                            onNewUrlChange={onNewUrlChange}
                            onSaveUrl={onSaveUrl}
                            onCancelEditing={onCancelEditing}
                            t={t}
                        />
                    ) : (
                        <div className="setting-group">
                            <div className="setting-control">
                                <button className="settings-button" onClick={onStartEditing}>
                                    {t('connection.editAddress')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showRetry ? (
                <RetryBlock
                    isReconnecting={connectionStatus === 'reconnecting'}
                    retryInfo={retryInfo}
                    onRetryNow={onRetryNow}
                    t={t}
                />
            ) : null}
        </Modal>
    );
};

export default ConnectionModal;
