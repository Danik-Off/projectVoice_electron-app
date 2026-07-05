/**
 * Voice Module - модуль голосового общения
 */
import type { IModule } from '../../core';
import VoiceRoomPage from './components/VoiceRoomPage';

export const voiceModule: IModule = {
    id: 'voice',
    name: 'Voice Communication Module',
    version: '1.0.0',
    dependencies: ['auth'], // Зависит от модуля аутентификации
    routes: [
        {
            path: 'server/:serverId/voiceRoom/:roomId',
            component: VoiceRoomPage,
            protected: true
        }
    ],
    // eslint-disable-next-line require-await -- No await needed
    async initialize() {
        console.warn('Voice module initialized');
        // Здесь можно добавить инициализацию WebRTC, подключение к сокетам и т.д.
    },
    // eslint-disable-next-line require-await -- No await needed
    async destroy() {
        console.warn('Voice module destroyed');
        // Очистка WebRTC соединений, отключение от сокетов
    }
};
