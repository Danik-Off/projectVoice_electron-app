/**
 * Конфигурация приложения
 */
import type { IAppConfig } from '../types';

// Базовый URL для всех сервисов (API и Socket)
const SAVED_URL = typeof localStorage !== 'undefined' ? localStorage.getItem('projectvoice_server_url') : null;
const BASE_SERVER_URL =
    SAVED_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const appConfig: IAppConfig = {
    api: {
        baseUrl: BASE_SERVER_URL,
        apiUrl: `${BASE_SERVER_URL}/api`
    },
    socket: {
        url: BASE_SERVER_URL,
        path: '/socket'
    },
    webrtc: {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                urls: 'stun:stun1.l.google.com:19302'
            }
        ]
    }
};

export const BASE_URL = appConfig.api.baseUrl;
export const API_URL = appConfig.api.apiUrl;
