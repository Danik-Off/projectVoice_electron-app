/**
 * ConnectionManager - контейнерный компонент (Composition Root для фичи).
 *
 * Получает сервисы из DI-контекста, вызывает хук useConnectionManager
 * и передаёт состояние/действия в презентационный ConnectionModal.
 *
 * Здесь НЕТ прямых импортов store, api или localStorage.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectionManager } from '../model/useConnectionManager';
import { useConnectionManagerDeps } from './ConnectionManagerContext';
import { createI18nAdapter } from '../api/I18nAdapter';
import ConnectionModal from './ConnectionModal';

const ConnectionManager: React.FC = () => {
    const { t } = useTranslation();
    const { connectionService, notificationService } = useConnectionManagerDeps();

    // i18n адаптер
    const i18nService = useMemo(() => createI18nAdapter(t), [t]);

    // Хук принимает сервисы через DI
    const {
        status: connectionStatus,
        serverUrl,
        retryInfo,
        isManualSettings,
        isEditing,
        newUrl,
        urlError,
        isSaving,
        isModalOpen,
        closeModal,
        startEditing,
        saveUrl,
        cancelEditing,
        setNewUrl,
        retryNow
    } = useConnectionManager(connectionService, notificationService, i18nService);

    if (!isModalOpen) {
        return null;
    }

    return (
        <ConnectionModal
            status={connectionStatus}
            serverUrl={serverUrl}
            retryInfo={retryInfo}
            isManualSettings={isManualSettings}
            isEditing={isEditing}
            newUrl={newUrl}
            urlError={urlError}
            isSaving={isSaving}
            onClose={closeModal}
            onStartEditing={startEditing}
            onSaveUrl={saveUrl}
            onCancelEditing={cancelEditing}
            onNewUrlChange={setNewUrl}
            onRetryNow={retryNow}
        />
    );
};

export default ConnectionManager;
