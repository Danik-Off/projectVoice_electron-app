/**
 * Public API feature connection-manager
 */

// UI
export { default as ConnectionManager } from './ui/ConnectionManager';
export { default as ConnectionModal } from './ui/ConnectionModal';
export { ConnectionManagerContext, useConnectionManagerDeps } from './ui/ConnectionManagerContext';

// Model
export { useConnectionManager } from './model/useConnectionManager';
export type { ConnectionManagerDeps } from './model/ports';
export type { ConnectionState, ConnectionActions, UseConnectionManagerReturn } from './model/types';

// API (адаптеры)
export { ConnectionServiceAdapter } from './api/ConnectionServiceAdapter';
export { NotificationAdapter } from './api/NotificationAdapter';
export { createI18nAdapter } from './api/I18nAdapter';
