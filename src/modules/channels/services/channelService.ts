import { apiClient } from '../../../core';
import type { Channel } from '../../../types/channel';

export const channelService = {
    // Создание канала
    create: async (serverId: number, data: Omit<Channel, 'id' | 'serverId'>) => {
        return apiClient(`/servers/${serverId}/channels`, { method: 'POST' }, data);
    },
    // Получение списка каналов по ID сервера
    getByServer: async (serverId: number) => {
        return apiClient(`/servers/${serverId}/channels`, { method: 'GET' });
    },
    // Получение канала по ID
    getById: async (serverId: number, channelId: number) => {
        return apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'GET' });
    },
    // Обновление информации о канале
    update: async (serverId: number, channelId: number, data: Partial<Channel>) => {
        return apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'PUT' }, data);
    },
    // Удаление канала
    delete: async (serverId: number, channelId: number) => {
        return apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'DELETE' });
    }
};
