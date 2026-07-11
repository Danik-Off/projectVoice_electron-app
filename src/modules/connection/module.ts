/**
 * Connection Module - модуль управления подключением к серверу
 *
 * У модуля нет маршрутов - компонент ConnectionManager рендерится
 * глобально в src/main.tsx поверх всего приложения.
 */
import type { IModule } from '../../core';

export const connectionModule: IModule = {
    id: 'connection',
    name: 'Connection Module',
    version: '1.0.0',
    routes: [],
    initialize() {
        return Promise.resolve();
    },
    destroy() {
        return Promise.resolve();
    }
};
