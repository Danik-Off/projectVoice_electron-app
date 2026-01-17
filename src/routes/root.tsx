/**
 * Root Router Configuration
 * Создает роутер приложения на основе зарегистрированных модулей
 */
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { moduleManager } from '../core';
import { ProtectedRoute, AdminRoute } from '../modules/auth';
import Layout from '../app/layout/Main';
import WelcomePage from '../modules/servers/welcomePage/WelcomePage';
import ProfileDemo from '../components/ProfileDemo';
import Auth from '../modules/auth/pages/Auth';
import NotFound from '../app/routes/NotFound';

/**
 * Создает роутер приложения на основе модулей
 * Должен вызываться ПОСЛЕ инициализации модулей (initializeApp)
 */
export function createRouter() {
    // Получаем все маршруты из зарегистрированных модулей
    const moduleRoutes = moduleManager.getRoutes();

    // Разделяем маршруты на категории
    const publicRoutes = moduleRoutes.filter((route) => route.path === '/auth' || route.path === '/invite/:token');

    // Маршруты сервера (вложенные в server/:serverId)
    const serverChildRoutes = moduleRoutes.filter(
        (route) =>
            route.path.startsWith('server/:serverId/') &&
            route.path !== 'server/:serverId' &&
            route.path !== 'server/:serverId/settings'
    );

    // Основной маршрут сервера
    const serverMainRoute = moduleRoutes.find((route) => route.path === 'server/:serverId');

    // Настройки сервера (вложенные в server/:serverId)
    const serverSettingsRoute = moduleRoutes.find((route) => route.path === 'server/:serverId/settings');

    // Остальные защищенные маршруты (settings, admin и т.д.)
    const otherProtectedRoutes = moduleRoutes.filter(
        (route) =>
            !route.path.includes('server/:serverId') &&
            route.path !== '/' &&
            route.path !== '/auth' &&
            route.path !== '/invite/:token'
    );

    // Создаем структуру маршрутов
    const routes = [
        // Публичные маршруты (должны быть первыми, вне Layout)
        ...publicRoutes.map((route) => {
            const RouteComponent = route.component;
            return {
                path: route.path,
                element: <RouteComponent />,
                errorElement: <NotFound />
            };
        }),

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

        // Главный защищенный маршрут с Layout
        {
            path: '/',
            element: (
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            ),
            errorElement: <NotFound />,
            children: [
                // Главная страница (WelcomePage)
                {
                    index: true,
                    element: <WelcomePage />
                },

                // Маршруты сервера с вложенными дочерними маршрутами
                ...(serverMainRoute
                    ? [
                          {
                              path: 'server/:serverId',
                              element: (() => {
                                  const ServerComponent = serverMainRoute.component;
                                  return <ServerComponent />;
                              })(),
                              children: [
                                  // Вложенные маршруты сервера (textRoom, voiceRoom)
                                  ...serverChildRoutes.map((route) => {
                                      // Убираем префикс 'server/:serverId/' из пути
                                      const childPath = route.path.replace(/^server\/:serverId\//, '');
                                      const RouteComponent = route.component;
                                      return {
                                          path: childPath,
                                          element:
                                              route.protected !== false ? (
                                                  <ProtectedRoute>
                                                      <RouteComponent />
                                                  </ProtectedRoute>
                                              ) : (
                                                  <RouteComponent />
                                              )
                                      };
                                  }),
                                  // Настройки сервера
                                  ...(serverSettingsRoute
                                      ? [
                                            {
                                                path: 'settings',
                                                element: (() => {
                                                    const SettingsComponent = serverSettingsRoute.component;
                                                    return serverSettingsRoute.protected !== false ? (
                                                        <ProtectedRoute>
                                                            <SettingsComponent />
                                                        </ProtectedRoute>
                                                    ) : (
                                                        <SettingsComponent />
                                                    );
                                                })()
                                            }
                                        ]
                                      : [])
                              ]
                          }
                      ]
                    : []),

                // Демо страница профиля
                {
                    path: 'profile-demo',
                    element: <ProfileDemo />
                },

                // Остальные защищенные маршруты из модулей (settings, admin и т.д.)
                ...otherProtectedRoutes.map((route) => {
                    // Убираем ведущий слеш из пути для относительных маршрутов
                    const cleanPath = route.path.startsWith('/') ? route.path.substring(1) : route.path;

                    const RouteComponent = route.component;

                    return {
                        path: cleanPath,
                        element: route.admin ? (
                            <AdminRoute>
                                <RouteComponent />
                            </AdminRoute>
                        ) : route.protected !== false ? (
                            <ProtectedRoute>
                                <RouteComponent />
                            </ProtectedRoute>
                        ) : (
                            <RouteComponent />
                        )
                    };
                }),

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

    return createBrowserRouter(routes);
}
