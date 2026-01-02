import { apiClient } from '../core';

export interface AppInfo {
    styles?: {
        primary?: string;
        secondary?: string;
        success?: string;
        danger?: string;
        warning?: string;
        info?: string;
        [key: string]: string | undefined;
    };
    version?: string;
    [key: string]: unknown;
}

class InfoService {
    /**
     * Получить информацию о приложении (включая стили Discord)
     */
    async getInfo(): Promise<AppInfo> {
        return await apiClient('/info', {
            method: 'GET'
        });
    }
}

export const infoService = new InfoService();

