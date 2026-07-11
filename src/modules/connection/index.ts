/**
 * Connection Module - публичный API
 */

// Components
export { default as ConnectionManager } from './components/ConnectionManager';
export { default as ConnectionModal } from './components/ConnectionModal';
export { ConnectionManagerContext, useConnectionManagerDeps } from './components/ConnectionManagerContext';

// Model
export { useConnectionManager } from './model/useConnectionManager';
export { validateServerUrl, normalizeServerUrl, formatUrlForDisplay } from './model/validators';
export type {
    ConnectionStatus,
    ServerConfig,
    ConnectionCheckResult,
    RetryInfo,
    ConnectionState,
    ConnectionActions,
    UseConnectionManagerReturn
} from './model/types';
export type {
    IConnectionService,
    IServerConfigStorage,
    INotificationService,
    I18nService,
    ConnectionManagerDeps
} from './model/ports';

// Services (адаптеры)
export { ConnectionServiceAdapter } from './services/ConnectionServiceAdapter';
export { NotificationAdapter } from './services/NotificationAdapter';
export { createI18nAdapter } from './services/I18nAdapter';

// Module registration
export { connectionModule } from './module';
