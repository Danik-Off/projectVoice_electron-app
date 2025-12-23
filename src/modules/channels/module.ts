/**
 * Channels Module - модуль работы с каналами
 */
import type { IModule } from '../../core';

export const channelsModule: IModule = {
    id: 'channels',
    name: 'Channels Module',
    version: '1.0.0',
    dependencies: ['auth', 'servers'],
    routes: [],
    async initialize() {
        console.log('Channels module initialized');
    },
    async destroy() {
        console.log('Channels module destroyed');
    },
};

