import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';

/**
 * Получает цвет самой высокой роли участника
 */
export const getHighestRoleColor = (member: ServerMember): string | undefined => {
    if (member.highestRole?.color) {
        return member.highestRole.color;
    }
    if (member.role === 'owner') {
        return '#faa61a';
    }
    if (member.role === 'admin') {
        return '#ed4245';
    }
    if (member.role === 'moderator') {
        return '#5865f2';
    }
    return undefined;
};

/**
 * Получает все роли участника
 */
export const getMemberRoles = (member: ServerMember, roles: Role[]): Role[] => {
    if (!member.roles) {
        return [];
    }

    return roles.filter((r) =>
        member.roles!.some((mr: Role | number) => (typeof mr === 'object' ? mr.id : mr) === r.id)
    );
};

/**
 * Получает отображаемое имя участника
 */
export const getMemberDisplayName = (member: ServerMember): string =>
    member.nickname || member.user?.username || 'Unknown';

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
