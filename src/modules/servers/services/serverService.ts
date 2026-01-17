import { apiClient } from '../../../core';
import type { Server } from '../../../types/server';

export const serverService = {
    // Создание сервера
    create: async (data: Omit<Server, 'id' | 'ownerId'>) => {
        const response = await apiClient('/servers', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    },
    // Получение списка серверов
    get: async () => {
        const data = await apiClient('/servers', {
            method: 'GET'
        });
        return data;
    },
    // Получение сервера по ID
    getBy: async (id: number) => {
        const data = await apiClient(`/servers/${id}`, {
            method: 'GET'
        });
        return data;
    },
    // Обновление информации о сервере
    update: async (id: number, data: Partial<Server>) => {
        const response = await apiClient(`/servers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    },
    // Удаление сервера
    delete: async (id: number) => {
        const response = await apiClient(`/servers/${id}`, {
            method: 'DELETE'
        });

        return response || { success: true };
    }
};
