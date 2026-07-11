/**
 * ServiceProvider - Composition Root приложения.
 *
 * Здесь создаются КОНКРЕТНЫЕ реализации сервисов (адаптеры)
 * и пробрасываются в дерево через React Context.
 *
 * Это единственное место, где "склеиваются" интерфейсы и реализации.
 * Все остальные слои работают только с интерфейсами (портами).
 *
 * Архитектура зависимостей:
 *   app/providers  ->  modules/{name}/services (адаптеры)
 *        |                |
 *        |                | реализует
 *        |                v
 *        +--provide-->  modules/{name}/model/ports (интерфейсы)
 *                        ^
 *                        | использует
 *                 modules/{name}/model/useXxx (хук)
 *                        ^
 *                        | вызывает
 *                 modules/{name}/components (компоненты)
 */

import React, { useMemo } from 'react';
import {
    ConnectionManagerContext,
    ConnectionServiceAdapter,
    NotificationAdapter as ConnectionNotificationAdapter,
    type ConnectionManagerDeps
} from '../../modules/connection';

interface ServiceProviderProps {
    children: React.ReactNode;
}

/**
 * Провайдер DI для всего приложения.
 * Оборачивает дерево во все контексты, пробрасывая реальные экземпляры сервисов.
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
    // Создаем экземпляры адаптеров один раз (composition root)

    // --- Connection Manager ---
    const connectionDeps = useMemo<ConnectionManagerDeps>(
        () => ({
            connectionService: new ConnectionServiceAdapter(),
            notificationService: new ConnectionNotificationAdapter(),
            i18nService: {
                t: (key: string) => key // fallback; реальный t подставляется в компоненте
            }
        }),
        []
    );

    return <ConnectionManagerContext.Provider value={connectionDeps}>{children}</ConnectionManagerContext.Provider>;
};
