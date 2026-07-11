/**
 * ConnectionManagerContext - DI-контекст для feature connection-manager.
 *
 * Composition root (app/providers) создаёт реальные реализации
 * сервисов и помещает их в контекст.
 */

import { createContext, useContext } from 'react';
import type { ConnectionManagerDeps } from '../model/ports';

export const ConnectionManagerContext = createContext<ConnectionManagerDeps | null>(null);

/**
 * Хук для получения зависимостей из контекста.
 * Бросает ошибку, если использован вне провайдера.
 */
export const useConnectionManagerDeps = (): ConnectionManagerDeps => {
    const deps = useContext(ConnectionManagerContext);
    if (deps === null) {
        throw new Error('useConnectionManagerDeps must be used within <ConnectionManagerContext.Provider>.');
    }
    return deps;
};
