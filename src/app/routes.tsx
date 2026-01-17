/**
 * Маршруты приложения
 * Автоматически собираются из зарегистрированных модулей
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { moduleManager } from '../core';
import { ProtectedRoute, AdminRoute } from '../modules/auth';
import Layout from './layout/Main';
import ChannelPage from '../modules/servers/pages/channelPage/ChannelPage';
import WelcomePage from '../modules/servers/welcomePage/WelcomePage';
import ProfileDemo from '../components/ProfileDemo';
import Auth from '../modules/auth/pages/Auth';
import NotFound from './routes/NotFound';
// Auth будет получен из модуля через маршруты, но добавим fallback

export function createAppRouter() {
    // Получаем маршруты из модулей
    const moduleRoutes = moduleManager.getRoutes();

    console.warn(
        'Module routes:',
        moduleRoutes.map((r) => ({ path: r.path, moduleId: r.moduleId }))
    );

    // Разделяем маршруты на категории
    const serverRoutes = moduleRoutes.filter(
        (route) => route.path.includes('server/:serverId') && route.path !== 'server/:serverId'
    );

    const publicRoutes = moduleRoutes.filter((route) => route.path === '/auth' || route.path === '/invite/:token');

    const otherRoutes = moduleRoutes.filter(
        (route) =>
            !route.path.includes('server/:serverId') &&
            route.path !== '/' &&
            route.path !== '/auth' &&
            route.path !== '/invite/:token'
    );

    console.log(
        'Public routes:',
        publicRoutes.map((r) => r.path)
    );
    console.log(
        'Other routes:',
        otherRoutes.map((r) => r.path)
    );

    // Базовые маршруты
    // ВАЖНО: Публичные маршруты должны быть ПЕРЕД защищенными, чтобы catch-all их не перехватывал
    const routes = [
        // Публичные маршруты из модулей (auth, invite) - ДОЛЖНЫ БЫТЬ ПЕРВЫМИ
        ...publicRoutes.map((route) => ({
            path: route.path,
            element: <route.component />,
            errorElement: <NotFound />
        })),
        // Fallback для /auth, если модуль не зарегистрировал маршрут
        ...(publicRoutes.find((r) => r.path === '/auth')
            ? []
            : [
                  {
                      path: '/auth',
                      element: <Auth />,
                      errorElement: <NotFound />
                  }
              ]),
        {
            path: '/',
            element: (
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            ),
            errorElement: <NotFound />,
            children: [
                {
                    index: true,
                    element: <WelcomePage />
                },
                {
                    path: 'server/:serverId',
                    element: <ChannelPage />,
                    children: [
                        // Вложенные маршруты сервера (textRoom, voiceRoom, settings)
                        ...serverRoutes.map((route) => {
                            // Убираем префикс 'server/:serverId/' из пути
                            const childPath = route.path.replace(/^server\/:serverId\//, '');
                            return {
                                path: childPath,
                                element: route.protected ? (
                                    <ProtectedRoute>
                                        <route.component />
                                    </ProtectedRoute>
                                ) : (
                                    <route.component />
                                )
                            };
                        })
                    ]
                },
                {
                    path: 'profile-demo',
                    element: <ProfileDemo />
                },
                // Динамические маршруты из модулей (settings, admin и т.д.)
                ...otherRoutes.map((route) => ({
                    path: route.path.startsWith('/') ? route.path.substring(1) : route.path,
                    element: route.admin ? (
                        <AdminRoute>
                            <route.component />
                        </AdminRoute>
                    ) : route.protected ? (
                        <ProtectedRoute>
                            <route.component />
                        </ProtectedRoute>
                    ) : (
                        <route.component />
                    )
                })),
                // Catch-all для 404 внутри защищенных маршрутов
                {
                    path: '*',
                    element: <NotFound />
                }
            ]
        },
        // Глобальный catch-all для всех остальных маршрутов (должен быть последним)
        {
            path: '*',
            element: <Navigate to="/" replace />
        }
    ];

    console.warn(
        'Final routes structure:',
        routes.map((r) => r.path)
    );

    return createBrowserRouter(routes);
}
