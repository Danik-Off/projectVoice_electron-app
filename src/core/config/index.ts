/**
 * Конфигурация приложения
 */
import type { IAppConfig } from '../types';

export const appConfig: IAppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://77.222.58.224:5000',
    apiUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://77.222.58.224:5000'}/api`,
  },
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'http://77.222.58.224:5555',
    path: '/socket',
  },
  webrtc: {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
    ],
  },
};

export const BASE_URL = appConfig.api.baseUrl;
export const API_URL = appConfig.api.apiUrl;

