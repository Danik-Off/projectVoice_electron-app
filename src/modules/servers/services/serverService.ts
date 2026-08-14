import { apiClient } from '../../../core';
import type { Server } from '../../../types/server';

export const serverService = {
    // Создание сервера
    create: (data: Omit<Server, 'id' | 'ownerId'>) => apiClient('/servers', { method: 'POST' }, data),
    // Получение списка серверов
    get: () => apiClient('/servers', { method: 'GET' }),
    // Получение сервера по ID
    getBy: (id: number) => apiClient(`/servers/${id}`, { method: 'GET' }),
    // Обновление информации о сервере
    update: (id: number, data: Partial<Server>) => apiClient(`/servers/${id}`, { method: 'PUT' }, data),
    // Удаление сервера
    delete: (id: number) => apiClient(`/servers/${id}`, { method: 'DELETE' })
};
