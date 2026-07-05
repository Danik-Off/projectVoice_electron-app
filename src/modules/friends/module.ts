/**
 * Friends Module - модуль работы с друзьями
 */
import type { IModule } from '../../core';

export const friendsModule: IModule = {
    id: 'friends',
    name: 'Friends Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [],
    initialize() {
        return Promise.resolve();
    },
    destroy() {
        return Promise.resolve();
    }
};
