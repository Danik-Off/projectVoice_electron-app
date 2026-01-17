/**
 * Servers Module - модуль работы с серверами
 */
import type { IModule } from '../../core';
import ChannelPage from './pages/channelPage/ChannelPage';
import ServerSettings from './pages/serverSettings/ServerSettings';

export const serversModule: IModule = {
    id: 'servers',
    name: 'Servers Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [
        {
            path: 'server/:serverId',
            component: ChannelPage,
            protected: true
        },
        {
            path: 'server/:serverId/settings',
            component: ServerSettings,
            protected: true
        }
    ],
    initialize() {
        console.warn('Servers module initialized');
        return Promise.resolve();
    },
    destroy() {
        console.warn('Servers module destroyed');
        return Promise.resolve();
    }
};
