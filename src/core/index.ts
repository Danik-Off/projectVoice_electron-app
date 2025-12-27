/**
 * Core Layer - Экспорт всех базовых сервисов
 */

// Config
export * from './config';
export { iceServers } from './config/iceServers';

// Types
export * from './types';

// API - должен быть экспортирован ПЕРЕД stores, чтобы избежать циклических зависимостей
export { apiClient } from './api/apiClient';

// Plugin System
export { PluginManager, pluginManager } from './plugin/PluginManager';
export type { IPlugin } from './types';

// Module System
export { ModuleManager, moduleManager } from './module/ModuleManager';
export type { IModule } from './types';

// Socket
export { default as SocketClient } from './socket/SocketClient';

// Stores - экспортируется последним, так как может зависеть от apiClient
export * from './store';
