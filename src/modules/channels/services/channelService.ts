import { apiClient } from '../../../core';
import type { Channel } from '../../../types/channel';

export const channelService = {
    // Создание канала
    create: async (serverId: number, data: Omit<Channel, 'id' | 'serverId'>) => {
        const response = await apiClient(`/servers/${serverId}/channels`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    },
    // Получение списка каналов по ID сервера
    getByServer: async (serverId: number) => {
        const data = await apiClient(`/servers/${serverId}/channels`, {
            method: 'GET',
        });
        return data;
    },
    // Получение канала по ID
    getById: async (serverId: number, channelId: number) => {
        const data = await apiClient(`/servers/${serverId}/channels/${channelId}`, {
            method: 'GET',
        });
        return data;
    },
    // Обновление информации о канале
    update: async (serverId: number, channelId: number, data: Partial<Channel>) => {
        const response = await apiClient(`/servers/${serverId}/channels/${channelId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    },
    // Удаление канала
    delete: async (serverId: number, channelId: number) => {
        const response = await apiClient(`/servers/${serverId}/channels/${channelId}`, {
            method: 'DELETE',
        });
        return response;
    },
};

