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
            protected: true
        }
    ],
    // eslint-disable-next-line require-await -- No await needed
    async initialize() {
        console.warn('Settings module initialized');
    },
    // eslint-disable-next-line require-await -- No await needed
    async destroy() {
        console.warn('Settings module destroyed');
    }
};
