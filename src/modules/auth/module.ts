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
    async initialize() {
        console.log('Auth module initialized');
    },
    async destroy() {
        console.log('Auth module destroyed');
    }
};

// Экспорт компонентов для использования в других модулях
export { ProtectedRoute, AdminRoute };
