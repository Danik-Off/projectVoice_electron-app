/**
 * Voice Module - модуль голосового общения
 */
import type { IModule } from '../../core';
import VoiceRoom from './components/VoiceRoom';

export const voiceModule: IModule = {
    id: 'voice',
    name: 'Voice Communication Module',
    version: '1.0.0',
    dependencies: ['auth'], // Зависит от модуля аутентификации
    routes: [
        {
            path: 'server/:serverId/voiceRoom/:roomId',
            component: VoiceRoom,
            protected: true
        }
    ],
    async initialize() {
        console.warn('Voice module initialized');
        // Здесь можно добавить инициализацию WebRTC, подключение к сокетам и т.д.
    },
    async destroy() {
        console.warn('Voice module destroyed');
        // Очистка WebRTC соединений, отключение от сокетов
    }
};
