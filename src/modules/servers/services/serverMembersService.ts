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

class ServerMembersService {
    /** Получить список участников сервера (GET /serverMembers/:serverId/members) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getServerMembers(serverId: number): Promise<ServerMember[]> {
        return apiClient(`/serverMembers/${serverId}/members`, {
            method: 'GET'
        });
    }

    /** Обновить роль участника (PUT /serverMembers/:serverId/members/:memberId) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async updateMemberRole(serverId: number, memberId: number, role: string): Promise<ServerMember> {
        return apiClient(
            `/serverMembers/${serverId}/members/${memberId}`,
            {
                method: 'PUT'
            },
            { role }
        );
    }

    /** Удалить участника из сервера (DELETE /serverMembers/:serverId/members/:memberId) */
    async removeMember(serverId: number, memberId: number): Promise<void> {
        await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    /** Добавить участника на сервер (POST /serverMembers/:serverId/members) */
    // eslint-disable-next-line require-await -- Returns promise directly
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
     * Передать владение сервером другому пользователю (POST /serverMembers/:serverId/owner)
     */
    // eslint-disable-next-line require-await -- Returns promise directly
    async transferOwnership(serverId: number, userId: number): Promise<{ message: string }> {
        return apiClient(
            `/serverMembers/${serverId}/owner`,
            {
                method: 'POST'
            },
            { userId }
        );
    }

    /**
     * Исключить участника из сервера (Kick).
     * Использует тот же endpoint, что и removeMember.
     */
    async kickMember(serverId: number, memberId: number): Promise<void> {
        await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    // ─── Методы ниже используют endpoints, отсутствующие в текущем API бэкенда ───
    // TODO: запросить добавление у бэкенд-команды, если функционал нужен.

    /**
     * Получить права текущего пользователя на сервере.
     * Endpoint /serverMembers/:serverId/members/me отсутствует в API бэкенда.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async getCurrentMemberPermissions(_serverId: number): Promise<CurrentMemberPermissions | null> {
        console.warn('getCurrentMemberPermissions: endpoint not available in current API');
        return null;
    }

    /**
     * Забанить участника.
     * Endpoint /serverMembers/:serverId/members/:memberId/ban отсутствует в API бэкенда.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async banMember(_serverId: number, _memberId: number, _reason?: string): Promise<void> {
        throw new Error('Ban endpoint is not available in the current API');
    }

    /**
     * Обновить голосовые настройки участника (Mute/Deafen).
     * Endpoint /serverMembers/:serverId/members/:memberId/voice отсутствует в API бэкенда.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async updateVoiceSettings(
        _serverId: number,
        _memberId: number,
        _isMuted?: boolean,
        _isDeafened?: boolean
    ): Promise<ServerMember> {
        throw new Error('Voice settings endpoint is not available in the current API');
    }

    /**
     * Обновить роли участника.
     * Endpoint /serverMembers/:serverId/members/:memberId/roles отсутствует в API бэкенда.
     * Используйте roleService.assignRoleToMember / removeRoleFromMember.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async updateMemberRoles(_serverId: number, _memberId: number, _roleIds: number[]): Promise<ServerMember> {
        throw new Error('Member roles endpoint is not available in the current API. Use roleService instead.');
    }

    /**
     * Получить список забаненных пользователей.
     * Endpoint /servers/:serverId/bans отсутствует в API бэкенда.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async getBans(_serverId: number): Promise<BanInfo[]> {
        throw new Error('Bans list endpoint is not available in the current API');
    }

    /**
     * Разбанить пользователя.
     * Endpoint /servers/:serverId/bans/:userId отсутствует в API бэкенда.
     */
    // eslint-disable-next-line require-await -- Stub: endpoint not available
    async unbanMember(_serverId: number, _userId: number): Promise<void> {
        throw new Error('Unban endpoint is not available in the current API');
    }
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

export const serverMembersService = new ServerMembersService();
