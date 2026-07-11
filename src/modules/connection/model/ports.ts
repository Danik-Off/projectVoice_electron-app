/**
 * Ports - интерфейсы для внешних сервисов подключения.
 * Домен определяет только ПОРТЫ, не зная о реализации.
 */

import type { ConnectionStatus, ConnectionCheckResult, RetryInfo } from './types';

/**
 * Порт сервиса подключения.
 * Отвечает за проверку и управление соединением с сервером.
 */
export interface IConnectionService {
    /** Текущий статус подключения */
    readonly status: ConnectionStatus;

    /** Текущий URL сервера */
    readonly serverUrl: string;

    /** Открыта ли модалка настроек вручную */
    readonly isSettingsModalOpen: boolean;

    /** Проверить подключение к серверу */
    checkConnection(): Promise<ConnectionCheckResult>;

    /** Установить новый URL сервера и перезапустить */
    setServerUrl(url: string): void;

    /** Начать автоматические попытки переподключения */
    startRetrying(): void;

    /** Остановить автоматические попытки переподключения */
    stopRetrying(): void;

    /** Открыть/закрыть модалку настроек вручную */
    setSettingsModalOpen(isOpen: boolean): void;

    /** Информация о текущих попытках переподключения */
    readonly retryInfo: RetryInfo | null;
}

/**
 * Порт хранилища конфигурации сервера.
 * Абстракция над localStorage.
 */
export interface IServerConfigStorage {
    /** Получить сохранённый URL сервера */
    getUrl(): string | null;

    /** Сохранить URL сервера */
    saveUrl(url: string): void;

    /** Удалить сохранённый URL */
    removeUrl(): void;
}

/**
 * Порт сервиса уведомлений.
 */
export interface INotificationService {
    notify(message: string, type: 'success' | 'error' | 'info'): void;
}

/**
 * Порт сервиса локализации (i18n).
 */
export interface I18nService {
    t: (key: string) => string;
}

/**
 * Контракт для DI-контекста - все сервисы, которые фича
 * получает извне через React Context.
 */
export interface ConnectionManagerDeps {
    connectionService: IConnectionService;
    notificationService: INotificationService;
    i18nService: I18nService;
}
