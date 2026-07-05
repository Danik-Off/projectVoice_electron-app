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
 *   app/providers  ->  features/{name}/api (адаптеры)
 *        |                |
 *        |                | реализует
 *        |                v
 *        +--provide-->  features/{name}/model/ports (интерфейсы)
 *                        ^
 *                        | использует
 *                 features/{name}/model/useXxx (хук)
 *                        ^
 *                        | вызывает
 *                 features/{name}/ui (компоненты)
 */

import React, { useMemo } from 'react';
import {
    ProfileSettingsContext,
    ProfileSettingsApi,
    NotificationAdapter as ProfileNotificationAdapter,
    type ProfileSettingsDeps
} from '../../features/profile-settings';

import {
    ConnectionManagerContext,
    ConnectionServiceAdapter,
    NotificationAdapter as ConnectionNotificationAdapter,
    type ConnectionManagerDeps
} from '../../features/connection-manager';

interface ServiceProviderProps {
    children: React.ReactNode;
}

/**
 * Провайдер DI для всего приложения.
 * Оборачивает дерево во все контексты, пробрасывая реальные экземпляры сервисов.
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
    // Создаем экземпляры адаптеров один раз (composition root)

    // --- Profile Settings ---
    const profileDeps = useMemo<ProfileSettingsDeps>(
        () => ({
            profileSettingsService: new ProfileSettingsApi(),
            notificationService: new ProfileNotificationAdapter(),
            i18nService: {
                t: (key: string) => key // fallback; реальный t подставляется в компоненте
            }
        }),
        []
    );

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

    return (
        <ProfileSettingsContext.Provider value={profileDeps}>
            <ConnectionManagerContext.Provider value={connectionDeps}>
                {children}
            </ConnectionManagerContext.Provider>
        </ProfileSettingsContext.Provider>
    );
};
