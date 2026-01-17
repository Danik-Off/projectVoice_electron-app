/**
 * Invite Module - модуль приглашений
 */
import type { IModule } from '../../core';
import InvitePage from './pages/InvitePage';

export const inviteModule: IModule = {
    id: 'invite',
    name: 'Invite Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [
        {
            path: '/invite/:token',
            component: InvitePage,
            protected: false
        }
    ],
    initialize() {
        console.warn('Invite module initialized');
        return Promise.resolve();
    },
    destroy() {
        console.warn('Invite module destroyed');
        return Promise.resolve();
    }
};
