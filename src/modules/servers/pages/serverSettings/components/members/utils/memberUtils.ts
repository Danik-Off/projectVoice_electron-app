import type { ServerMember } from '../../../../../services/serverMembersService';
import type { Role } from '../../../../../types/role';

/**
 * Получает цвет самой высокой роли участника
 */
export const getHighestRoleColor = (member: ServerMember): string | null => {
    if (member.highestRole?.color != null && member.highestRole.color.length > 0) {
        return member.highestRole.color;
    }
    const memberRole: 'member' | 'moderator' | 'admin' | 'owner' = member.role;
    if (memberRole === 'owner') {
        return '#faa61a';
    }
    if (memberRole === 'admin') {
        return '#ed4245';
    }
    if (memberRole === 'moderator') {
        return '#5865f2';
    }
    return null;
};

/**
 * Получает все роли участника
 */
export const getMemberRoles = (member: ServerMember, roles: Role[]): Role[] => {
    if (member.roles == null || member.roles.length === 0) {
        return [];
    }

    const filteredRoles: Role[] = [];
    for (const r of roles) {
        const memberRoles = member.roles;
        if (memberRoles == null) {
            continue;
        }
        // Явная типизация для устранения unsafe assignment
        if (typeof r === 'object' && r != null && 'id' in r && 'name' in r) {
            const roleObj = r as { id: unknown; name: unknown; color?: unknown };
            const roleIdValue = roleObj.id;
            if (typeof roleIdValue !== 'number') {
                continue;
            }
            const role: Role = {
                id: roleIdValue,
                name: typeof roleObj.name === 'string' ? roleObj.name : '',
                serverId: 0,
                permissions: '',
                position: 0,
                createdAt: '',
                updatedAt: '',
                ...(typeof roleObj.color === 'string' ? { color: roleObj.color } : {})
            };
            const roleId: number = roleIdValue;
            const isMatch = memberRoles.some((mr) => {
                if (typeof mr === 'object' && mr != null && 'id' in mr) {
                    const mrId = (mr as { id: unknown }).id;
                    return typeof mrId === 'number' && mrId === roleId;
                }
                if (typeof mr === 'number') {
                    return mr === roleId;
                }
                return false;
            });
            if (isMatch) {
                filteredRoles.push(role);
            }
        }
    }
    return filteredRoles;
};

/**
 * Получает отображаемое имя участника
 */
export const getMemberDisplayName = (member: ServerMember): string => {
    const nickname: string | undefined = member.nickname;
    const username: string | undefined = member.user?.username;
    if (nickname != null && nickname.length > 0) {
        return nickname;
    }
    if (username != null && username.length > 0) {
        return username;
    }
    return 'Unknown';
};

/**
 * Получает текст роли для отображения
 */
export const getRoleDisplayText = (role: string): string => {
    const roleTexts: Record<string, string> = {
        owner: '👑 Владелец',
        admin: '⚡ Администратор',
        moderator: '🛡️ Модератор',
        member: '👤 Участник'
    };
    return roleTexts[role] || '👤 Участник';
};
