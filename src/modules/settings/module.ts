/**
 * Settings Module - модуль настроек
 */
import type { IModule } from '../../core';
import Settings from './pages/Settings';

export const settingsModule: IModule = {
    id: 'settings',
    name: 'Settings Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [
        {
            path: 'settings',
            component: Settings,
            protected: true,
        },
    ],
    async initialize() {
        console.log('Settings module initialized');
    },
    async destroy() {
        console.log('Settings module destroyed');
    },
};

