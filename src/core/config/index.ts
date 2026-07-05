/**
 * Конфигурация приложения
 */
import type { IAppConfig } from '../types';

// Базовый URL для всех сервисов (API и Socket)
const SAVED_URL = typeof localStorage !== 'undefined' ? localStorage.getItem('projectvoice_server_url') : null;
const BASE_SERVER_URL =
    SAVED_URL !== null && SAVED_URL !== ''
        ? SAVED_URL
        : typeof import.meta.env.VITE_API_BASE_URL !== 'undefined' && import.meta.env.VITE_API_BASE_URL !== null && import.meta.env.VITE_API_BASE_URL !== ''
          ? (import.meta.env.VITE_API_BASE_URL as string)
          : typeof import.meta.env.VITE_SOCKET_URL !== 'undefined' && import.meta.env.VITE_SOCKET_URL !== null && import.meta.env.VITE_SOCKET_URL !== ''
            ? (import.meta.env.VITE_SOCKET_URL as string)
            : 'http://localhost:5000';

export const appConfig: IAppConfig = {
    api: {
        baseUrl: BASE_SERVER_URL,
        apiUrl: `${BASE_SERVER_URL}/api`
    },
    socket: {
        url: BASE_SERVER_URL,
        path: '/socket'
    }
};

export const BASE_URL = appConfig.api.baseUrl;
export const API_URL = appConfig.api.apiUrl;
