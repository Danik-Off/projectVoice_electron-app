import { apiClient } from '../../../core';
import type { Channel } from '../../../types/channel';
import type { ServerMember } from '../../../types/server';

export interface AdminStats {
    users: {
        total: number;
        active: number;
        blocked: number;
        byRole: {
            admin: number;
            moderator: number;
            user: number;
        };
    };
    servers: {
        total: number;
        active: number;
        blocked: number;
        withChannels: number;
    };
    channels: {
        total: number;
        text: number;
        voice: number;
    };
    messages: {
        total: number;
        today: number;
    };
}

export interface UserFilters {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
}

export interface ServerFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    serverMembers?: ServerMember[];
}

export interface Server {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    isBlocked: boolean;
    blockReason?: string;
    blockedAt?: string;
    blockedBy?: number;
    createdAt: string;
    updatedAt: string;
    owner?: {
        id: number;
        username: string;
        email: string;
    };
    blockedByUser?: {
        id: number;
        username: string;
    };
    channels?: Channel[];
}

export interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ServersResponse {
    servers: Server[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LogsResponse {
    system: string;
    errors: string;
    access: string;
}

export interface BlockServerRequest {
    reason: string;
}

export interface UpdateUserRequest {
    role?: 'user' | 'moderator' | 'admin';
    isActive?: boolean;
}

class AdminService {
    getStats(): Promise<AdminStats> {
        return apiClient('/admin/stats', { method: 'GET' });
    }

    getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
        const params = new URLSearchParams();
        if (filters.page != null && filters.page !== 0) {
            params.append('page', filters.page.toString());
        }
        if (filters.limit != null && filters.limit !== 0) {
            params.append('limit', filters.limit.toString());
        }
        if (filters.search != null && filters.search !== '') {
            params.append('search', filters.search);
        }
        if (filters.role != null && filters.role !== '') {
            params.append('role', filters.role);
        }
        if (filters.status != null && filters.status !== '') {
            params.append('status', filters.status);
        }

        return apiClient(`/admin/users?${params.toString()}`, { method: 'GET' });
    }

    getUser(userId: number): Promise<User> {
        return apiClient(`/admin/users/${userId}`, { method: 'GET' });
    }

    updateUser(userId: number, updates: UpdateUserRequest): Promise<{ message: string; user: User }> {
        return apiClient(`/admin/users/${userId}`, { method: 'PUT' }, updates);
    }

    deleteUser(userId: number): Promise<{ message: string }> {
        return apiClient(`/admin/users/${userId}`, { method: 'DELETE' });
    }

    getServers(filters: ServerFilters = {}): Promise<ServersResponse> {
        const params = new URLSearchParams();
        if (filters.page != null && filters.page !== 0) {
            params.append('page', filters.page.toString());
        }
        if (filters.limit != null && filters.limit !== 0) {
            params.append('limit', filters.limit.toString());
        }
        if (filters.search != null && filters.search !== '') {
            params.append('search', filters.search);
        }
        if (filters.status != null && filters.status !== '') {
            params.append('status', filters.status);
        }

        return apiClient(`/admin/servers?${params.toString()}`, { method: 'GET' });
    }

    getServer(serverId: number): Promise<Server> {
        return apiClient(`/admin/servers/${serverId}`, { method: 'GET' });
    }

    blockServer(serverId: number, data: BlockServerRequest): Promise<{ message: string; server: Server }> {
        return apiClient(`/admin/servers/${serverId}/block`, { method: 'POST' }, data);
    }

    unblockServer(serverId: number): Promise<{ message: string; server: Server }> {
        return apiClient(`/admin/servers/${serverId}/unblock`, { method: 'POST' });
    }

    deleteServer(serverId: number): Promise<{ message: string }> {
        return apiClient(`/admin/servers/${serverId}`, { method: 'DELETE' });
    }

    getLogs(): Promise<LogsResponse> {
        return apiClient('/admin/logs', { method: 'GET' });
    }
}

export const adminService = new AdminService();
