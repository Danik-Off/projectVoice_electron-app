/**
 * Auth Module - модуль аутентификации
 */
import type { IModule } from '../../core';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export const authModule: IModule = {
    id: 'auth',
    name: 'Authentication Module',
    version: '1.0.0',
    routes: [
        {
            path: '/auth',
            component: Auth,
            protected: false
        }
    ],
    initialize() {
        console.warn('Auth module initialized');
        return Promise.resolve();
    },
    destroy() {
        console.warn('Auth module destroyed');
        return Promise.resolve();
    }
};

// Экспорт компонентов для использования в других модулях
export { ProtectedRoute, AdminRoute };
