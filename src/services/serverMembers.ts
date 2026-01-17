import { apiClient } from '../core';

export const serverMembersService = {
    // Добавление участника в канал
    addMember: async (serverId: number, userId: number, role: string) => {
        const response = await apiClient(
            `/servers/${serverId}/members`,
            {
                method: 'POST'
            },
            { userId, role }
        );
        return response;
    },
    // Получение списка участников канала
    getMembers: async (serverId: number) => {
        const data = await apiClient(`/servers/${serverId}/members`, {
            method: 'GET'
        });
        return data;
    },
    // Обновление роли участника канала
    updateMember: async (serverId: number, memberId: number, role: string) => {
        const response = await apiClient(
            `/servers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
        return response;
    },
    updateRole: async (serverId: number, memberId: number, role: string) => {
        const response = await apiClient(
            `/servers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
        return response;
    },
    // Удаление участника из канала
    removeMember: async (serverId: number, memberId: number) => {
        const response = await apiClient(`/servers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
        return response;
    }
};
