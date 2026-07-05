import { apiClient } from '../../../core';
import type { Channel } from '../../../types/channel';

export const channelService = {
    // Создание канала
    create: (serverId: number, data: Omit<Channel, 'id' | 'serverId'>) => apiClient(`/servers/${serverId}/channels`, { method: 'POST' }, data),
    // Получение списка каналов по ID сервера
    getByServer: (serverId: number) => apiClient(`/servers/${serverId}/channels`, { method: 'GET' }),
    // Получение канала по ID
    getById: (serverId: number, channelId: number) => apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'GET' }),
    // Обновление информации о канале
    update: (serverId: number, channelId: number, data: Partial<Channel>) => apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'PUT' }, data),
    // Удаление канала
    delete: (serverId: number, channelId: number) => apiClient(`/servers/${serverId}/channels/${channelId}`, { method: 'DELETE' })
};
