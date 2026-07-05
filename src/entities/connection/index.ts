/**
 * Public API entity/connection
 */
export type { ConnectionStatus, ServerConfig, ConnectionCheckResult, RetryInfo } from './model/types';
export type { IConnectionService, IServerConfigStorage, INotificationService, I18nService } from './model/ports';
export { validateServerUrl, normalizeServerUrl, formatUrlForDisplay } from './lib/validators';
