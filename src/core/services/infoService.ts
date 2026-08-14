import { apiClient } from '../api/apiClient';

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
     * Получить информацию о приложении (включая стили).
     *
     * В новом NestJS API endpoint /info отсутствует.
     * Метод возвращает пустой объект при ошибке, чтобы не блокировать инициализацию.
     */
    async getInfo(): Promise<AppInfo> {
        try {
            return await apiClient('/info', {
                method: 'GET'
            });
        } catch {
            // Endpoint /info не существует в новом API — возвращаем пустой объект
            return {};
        }
    }
}

export const infoService = new InfoService();
