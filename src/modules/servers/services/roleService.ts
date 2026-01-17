/**
 * Сервис для работы с ролями сервера
 */
import { apiClient } from '../../../core';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/role';

export const roleService = {
    /**
     * Получить все роли сервера
     * @param serverId - ID сервера
     * @returns массив ролей, отсортированных по позиции
     */
    getRoles: async (serverId: number): Promise<Role[]> => {
        const roles = await apiClient<Role[]>(`/servers/${serverId}/roles`, {
            method: 'GET'
        });
        // Сортировка по позиции (больше = выше в иерархии)
        return roles.sort((a, b) => b.position - a.position);
    },

    /**
     * Создать новую роль
     * @param serverId - ID сервера
     * @param roleData - данные роли
     * @returns созданная роль
     */
    createRole: async (serverId: number, roleData: CreateRoleRequest): Promise<Role> =>
        await apiClient<Role>(
            `/servers/${serverId}/roles`,
            {
                method: 'POST'
            },
            roleData
        ),

    /**
     * Обновить роль
     * @param serverId - ID сервера
     * @param roleId - ID роли
     * @param roleData - данные для обновления
     * @returns обновленная роль
     */
    updateRole: async (serverId: number, roleId: number, roleData: UpdateRoleRequest): Promise<Role> =>
        await apiClient<Role>(
            `/servers/${serverId}/roles/${roleId}`,
            {
                method: 'PATCH'
            },
            roleData
        ),

    /**
     * Удалить роль
     * @param serverId - ID сервера
     * @param roleId - ID роли
     */
    deleteRole: async (serverId: number, roleId: number): Promise<void> => {
        await apiClient(`/servers/${serverId}/roles/${roleId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Назначить роль участнику
     * @param serverId - ID сервера
     * @param memberId - ID участника
     * @param roleId - ID роли
     */
    assignRoleToMember: async (serverId: number, memberId: number, roleId: number): Promise<void> => {
        await apiClient(`/servers/${serverId}/roles/members/${memberId}/roles/${roleId}`, {
            method: 'POST'
        });
    },

    /**
     * Удалить роль у участника
     * @param serverId - ID сервера
     * @param memberId - ID участника
     * @param roleId - ID роли
     */
    removeRoleFromMember: async (serverId: number, memberId: number, roleId: number): Promise<void> => {
        await apiClient(`/servers/${serverId}/roles/members/${memberId}/roles/${roleId}`, {
            method: 'DELETE'
        });
    }
};
