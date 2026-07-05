/**
 * Ports для feature connection-manager.
 *
 * Хук useConnectionManager работает только с этими интерфейсами.
 * Реализации передаются через DI (React Context) из app/providers.
 */

import type {
    IConnectionService,
    INotificationService,
    I18nService
} from '../../../entities/connection';

/**
 * Контракт для DI-контекста - все сервисы, которые фича
 * получает извне через React Context.
 */
export interface ConnectionManagerDeps {
    connectionService: IConnectionService;
    notificationService: INotificationService;
    i18nService: I18nService;
}
