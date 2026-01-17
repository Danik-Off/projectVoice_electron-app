/**
 * Admin Module - модуль администрирования
 */
import type { IModule } from '../../core';
import AdminPanel from './pages/AdminPanel';

export const adminModule: IModule = {
    id: 'admin',
    name: 'Admin Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [
        {
            path: 'admin',
            component: AdminPanel,
            protected: true,
            admin: true
        }
    ],
    initialize() {
        console.warn('Admin module initialized');
        return Promise.resolve();
    },
    destroy() {
        console.warn('Admin module destroyed');
        return Promise.resolve();
    }
};
