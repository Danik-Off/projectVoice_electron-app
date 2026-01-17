import { apiClient } from '../core';
import type { Server } from '../types/server';

export const serverService = {
    // Создание сервера
    create: async (data: Omit<Server, 'id' | 'ownerId'>) => {
        const response = await apiClient(
            '/servers',
            {
                method: 'POST'
            },
            data
        );
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
        const response = await apiClient(
            `/servers/${id}`,
            {
                method: 'PUT'
            },
            data
        );
        return response;
    },
    // Удаление сервера
    delete: async (id: number) => {
        const response = await apiClient(`/servers/${id}`, {
            method: 'DELETE'
        });
        console.log('ServerService delete response:', response);
        return response || { success: true }; // Возвращаем объект успеха если ответ null
    }
};
