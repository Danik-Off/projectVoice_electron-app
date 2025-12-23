/**
 * Messaging Module - модуль сообщений
 */
import type { IModule } from '../../core';
import MessageList from '../../pages/channelPage/components/messageList/MessageList';

export const messagingModule: IModule = {
    id: 'messaging',
    name: 'Messaging Module',
    version: '1.0.0',
    dependencies: ['auth'],
    routes: [
        {
            path: 'server/:serverId/textRoom/:roomId',
            component: MessageList,
            protected: true,
        },
    ],
    async initialize() {
        console.log('Messaging module initialized');
        // Инициализация подключения к сокетам для сообщений
    },
    async destroy() {
        console.log('Messaging module destroyed');
        // Отключение от сокетов
    },
};

