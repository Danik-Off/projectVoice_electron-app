/**
 * Типы для работы с ролями
 */

export interface Role {
    id: number;
    serverId: number;
    name: string;
    color?: string;
    permissions: string; // BigInt в виде строки
    position: number;
    isHoisted?: boolean;
    isMentionable?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleRequest {
    name: string;
    color?: string;
    permissions?: string; // BigInt в виде строки
    position?: number;
    isHoisted?: boolean;
    isMentionable?: boolean;
}

export interface UpdateRoleRequest {
    name?: string;
    color?: string;
    permissions?: string; // BigInt в виде строки
    position?: number;
    isHoisted?: boolean;
    isMentionable?: boolean;
}

export interface MemberRole {
    memberId: number;
    roleId: number;
}

export interface RoleHierarchy {
    role: Role;
    canEdit: boolean;
    canDelete: boolean;
}

