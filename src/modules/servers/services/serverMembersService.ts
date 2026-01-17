import { apiClient } from '../../../core';

export interface ServerMember {
    id: number;
    userId: number;
    serverId: number;
    role: 'member' | 'moderator' | 'admin' | 'owner';
    nickname?: string;
    roles?: Array<{
        id: number;
        name: string;
        color?: string;
        permissions: string;
        position: number;
    }>;
    user?: {
        id: number;
        username: string;
        profilePicture?: string;
    };
    totalPermissions?: string; // BigInt в виде строки
    highestRole?: {
        id: number;
        name: string;
        color?: string;
        position: number;
    };
    isMuted?: boolean;
    isDeafened?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CurrentMemberPermissions {
    totalPermissions: string; // BigInt в виде строки
    roles: Array<{
        id: number;
        name: string;
        color?: string;
        permissions: string;
        position: number;
    }>;
}

export interface BanInfo {
    id: number;
    userId: number;
    serverId: number;
    reason?: string;
    bannedBy?: number;
    user?: {
        id: number;
        username: string;
        profilePicture?: string;
    };
    bannedAt: string;
}

class ServerMembersService {
    async getServerMembers(serverId: number): Promise<ServerMember[]> {
        return apiClient(`/serverMembers/${serverId}/members`, {
            method: 'GET'
        });
    }

    async updateMemberRole(serverId: number, memberId: number, role: string): Promise<ServerMember> {
        return apiClient(
            `/serverMembers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
    }

    async removeMember(serverId: number, memberId: number): Promise<void> {
        await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    async addMember(serverId: number, userId: number, role = 'member'): Promise<ServerMember> {
        return apiClient(
            `/serverMembers/${serverId}/members`,
            {
                method: 'POST'
            },
            { userId, role }
        );
    }

    /**
     * Получить права текущего пользователя на сервере
     */
    async getCurrentMemberPermissions(serverId: number): Promise<CurrentMemberPermissions> {
        return apiClient(`/serverMembers/${serverId}/members/me`, {
            method: 'GET'
        });
    }

    /**
     * Исключить участника из сервера (Kick)
     */
    async kickMember(serverId: number, memberId: number): Promise<void> {
        await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Забанить участника
     */
    async banMember(serverId: number, memberId: number, reason?: string): Promise<void> {
        await apiClient(
            `/serverMembers/${serverId}/members/${memberId}/ban`,
            {
                method: 'POST'
            },
            { reason }
        );
    }

    /**
     * Обновить голосовые настройки участника (Mute/Deafen)
     */
    async updateVoiceSettings(
        serverId: number,
        memberId: number,
        isMuted?: boolean,
        isDeafened?: boolean
    ): Promise<ServerMember> {
        return apiClient(
            `/serverMembers/${serverId}/members/${memberId}/voice`,
            {
                method: 'PATCH'
            },
            { isMuted, isDeafened }
        );
    }

    /**
     * Обновить роли участника
     */
    async updateMemberRoles(serverId: number, memberId: number, roleIds: number[]): Promise<ServerMember> {
        return apiClient(
            `/serverMembers/${serverId}/members/${memberId}/roles`,
            {
                method: 'PUT'
            },
            { roleIds }
        );
    }

    /**
     * Получить список забаненных пользователей
     */
    async getBans(serverId: number): Promise<BanInfo[]> {
        return apiClient(`/servers/${serverId}/bans`, {
            method: 'GET'
        });
    }

    /**
     * Разбанить пользователя
     */
    async unbanMember(serverId: number, userId: number): Promise<void> {
        await apiClient(`/servers/${serverId}/bans/${userId}`, {
            method: 'DELETE'
        });
    }
}

export const serverMembersService = new ServerMembersService();
