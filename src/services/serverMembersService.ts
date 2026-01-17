import { apiClient } from '../core';

export interface ServerMember {
    id: number;
    userId: number;
    serverId: number;
    role: 'member' | 'moderator' | 'admin' | 'owner';
    user?: {
        id: number;
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
    updatedAt: string;
}

class ServerMembersService {
    // eslint-disable-next-line require-await -- Returns promise directly
    async getServerMembers(serverId: number): Promise<ServerMember[]> {
        return apiClient(`/serverMembers/${serverId}/members`, {
            method: 'GET'
        });
    }

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

    async removeMember(serverId: number, memberId: number): Promise<void> {
        await apiClient(`/serverMembers/${serverId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

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
}

export const serverMembersService = new ServerMembersService();
