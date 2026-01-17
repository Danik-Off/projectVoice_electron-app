/**
 * Servers Module - публичный API
 */
export { serversModule } from './module';
export { serverService } from './services/serverService';
export { serverMembersService } from './services/serverMembersService';
export { roleService } from './services/roleService';
export type { ServerMember, BanInfo, CurrentMemberPermissions } from './services/serverMembersService';
export type { Role, CreateRoleRequest, UpdateRoleRequest } from './types/role';
export { default as serverStore } from './store/serverStore';

// Константы и утилиты для работы с разрешениями
export { Permissions, PermissionNames, PermissionGroups } from './constants/permissions';
export {
    hasPermission,
    calculateTotalPermissions,
    permissionsToString,
    stringToPermissions,
    combinePermissions,
    removePermission,
    addPermission,
    canEditRole,
    canDeleteRole
} from './utils/permissions';
