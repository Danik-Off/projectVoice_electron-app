/**
 * Базовые типы ядра приложения
 */

import type React from 'react';

export interface IPlugin {
    id: string;
    name: string;
    version: string;
    initialize: () => Promise<void> | void;
    destroy?: () => Promise<void> | void;
    dependencies?: string[];
}

export interface IModule {
    id: string;
    name: string;
    version: string;
    routes?: Array<{
        path: string;
        component: React.ComponentType;
        protected?: boolean;
        admin?: boolean;
    }>;
    initialize: () => Promise<void> | void;
    destroy?: () => Promise<void> | void;
    dependencies?: string[];
}

export interface IAppConfig {
    api: {
        baseUrl: string;
        apiUrl: string;
    };
    socket: {
        url: string;
        path: string;
    };
    webrtc: {
        iceServers: RTCIceServer[];
    };
}
