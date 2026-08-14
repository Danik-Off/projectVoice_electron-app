/**
 * useConnectionManager - хук-ядро feature connection-manager.
 *
 * ПРИНЦИП ИНВЕРСИИ ЗАВИСИМОСТЕЙ:
 * Хук НЕ импортирует store, api или любые конкретные реализации.
 * Он принимает сервисы через DI (Dependency Injection).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { IConnectionService, INotificationService, I18nService } from './ports';
import { validateServerUrl, normalizeServerUrl } from './validators';
import type { UseConnectionManagerReturn } from './types';

/**
 * Опрашивает сервис раз в 300мс и синхронизирует статус/ретраи/ручные настройки.
 * Также автоматически запускает ретраи, как только обнаружен разрыв связи -
 * пользователю не нужно вручную нажимать "Повторить" при первом же дисконнекте.
 */
const useConnectionStatusPolling = (service: IConnectionService) => {
    const [connectionStatus, setConnectionStatus] = useState(service.status);
    const [retryInfo, setRetryInfo] = useState(service.retryInfo);
    const [isManualSettings, setIsManualSettings] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const interval = setInterval(() => {
            if (!isMounted.current) return;
            setConnectionStatus(service.status);
            setRetryInfo(service.retryInfo);
            setIsManualSettings(service.isSettingsModalOpen);
        }, 300);

        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [service]);

    useEffect(() => {
        if (connectionStatus === 'disconnected' && !isManualSettings) {
            service.startRetrying();
        }
    }, [connectionStatus, isManualSettings, service]);

    return { connectionStatus, retryInfo, isManualSettings, setIsManualSettings };
};

/**
 * Основной хук. Принимает сервисы через DI.
 */
export const useConnectionManager = (
    service: IConnectionService,
    notifier: INotificationService,
    i18n: I18nService
): UseConnectionManagerReturn => {
    // --- Состояние ---
    const [isEditing, setIsEditing] = useState(false);
    const [newUrl, setNewUrl] = useState(service.serverUrl);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { connectionStatus, retryInfo, isManualSettings, setIsManualSettings } = useConnectionStatusPolling(service);

    // --- Модалка открыта, если нет подключения (в т.ч. идут ретраи) ИЛИ открыты настройки вручную ---
    const isModalOpen = connectionStatus === 'disconnected' || connectionStatus === 'reconnecting' || isManualSettings;

    // --- Действия ---
    const openSettings = useCallback(() => {
        service.setSettingsModalOpen(true);
        setIsManualSettings(true);
        setNewUrl(service.serverUrl);
        setUrlError(null);
    }, [service, setIsManualSettings]);

    const closeModal = useCallback(() => {
        if (isManualSettings) {
            service.setSettingsModalOpen(false);
            setIsManualSettings(false);
        }
        setIsEditing(false);
        setUrlError(null);
    }, [isManualSettings, service, setIsManualSettings]);

    const startEditing = useCallback(() => {
        setIsEditing(true);
        setNewUrl(service.serverUrl);
        setUrlError(null);
    }, [service]);

    const saveUrl = useCallback(() => {
        const error = validateServerUrl(newUrl);
        if (error !== null) {
            setUrlError(i18n.t('connection.invalidUrl'));
            return;
        }

        setIsSaving(true);
        const normalized = normalizeServerUrl(newUrl);
        try {
            service.setServerUrl(normalized);
            // setServerUrl вызывает window.location.reload(),
            // поэтому дальнейший код может не выполниться
        } catch (err) {
            setIsSaving(false);
            notifier.notify(i18n.t('connection.saveError'), 'error');
            console.error('Failed to save server URL:', err);
        }
    }, [newUrl, service, notifier, i18n]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setUrlError(null);
        setNewUrl(service.serverUrl);
    }, [service]);

    const handleSetNewUrl = useCallback(
        (url: string) => {
            setNewUrl(url);
            if (urlError !== null) {
                setUrlError(null);
            }
        },
        [urlError]
    );

    const retryNow = useCallback(() => {
        service.startRetrying();
    }, [service]);

    return {
        // Состояния
        status: connectionStatus,
        serverUrl: service.serverUrl,
        retryInfo,
        isModalOpen,
        isManualSettings,
        isEditing,
        newUrl,
        urlError,
        isSaving,

        // Действия
        openSettings,
        closeModal,
        startEditing,
        saveUrl,
        cancelEditing,
        setNewUrl: handleSetNewUrl,
        retryNow
    };
};
