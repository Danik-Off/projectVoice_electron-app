/**
 * Core Layer - Экспорт всех базовых сервисов
 */

// Config
export * from './config';
export { iceServers } from './config/iceServers';

// Types
export * from './types';

// Plugin System
export { PluginManager, pluginManager } from './plugin/PluginManager';
export type { IPlugin } from './types';

// Module System
export { ModuleManager, moduleManager } from './module/ModuleManager';
export type { IModule } from './types';

// API
export { apiClient } from './api/apiClient';

// Socket
export { default as SocketClient } from './socket/SocketClient';

// Stores
export * from './store';
