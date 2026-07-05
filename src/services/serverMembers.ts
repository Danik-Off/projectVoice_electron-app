import { apiClient } from '../core';

export const serverMembersService = {
    // Добавление участника на сервер
    addMember: async (serverId: number, userId: number, role: string) => {
        const response = await apiClient(
            `/serverMembers/${serverId}/members`,
            {
                method: 'POST'
            },
            { userId, role }
        );
        return response;
    },
    // Получение списка участников сервера
    getMembers: async (serverId: number) => {
        const data = await apiClient(`/serverMembers/${serverId}/members`, {
            method: 'GET'
        });
        return data;
    },
    // Обновление роли участника
    updateMember: async (serverId: number, memberId: number, role: string) => {
        const response = await apiClient(
            `/serverMembers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
        return response;
    },
    updateRole: async (serverId: number, memberId: number, role: string) => {
        const response = await apiClient(
            `/serverMembers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
        return response;
    },
    // Удаление участника с сервера
    removeMember: async (serverId: number, memberId: number) => {
        const response = await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
        return response;
    }
};
