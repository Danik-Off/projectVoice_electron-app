import type { ServerMember } from '../../../../../services/serverMembersService';
import type { Role } from '../../../../../types/role';
import type { SortOption, FilterOption, GroupedMembers } from '../types';

/**
 * Фильтрует участников по поисковому запросу
 */
export const filterBySearch = (members: ServerMember[], query: string): ServerMember[] => {
    if (query.trim().length === 0) {
        return members;
    }

    const lowerQuery = query.toLowerCase();
    return members.filter((member) => {
        const username: string = member.user?.username?.toLowerCase() ?? '';
        const nickname: string = member.nickname?.toLowerCase() ?? '';
        return username.includes(lowerQuery) || nickname.includes(lowerQuery);
    });
};

/**
 * Фильтрует участников по роли
 */
export const filterByRole = (members: ServerMember[], filter: FilterOption): ServerMember[] => {
    if (filter === 'all') {
        return members;
    }
    return members.filter((member) => member.role === filter);
};

/**
 * Получает цвет роли по умолчанию
 */
const getDefaultRoleColor = (roleName: string): string => {
    const defaultColors: Record<string, string> = {
        owner: '#faa61a',
        admin: '#ed4245',
        moderator: '#5865f2'
    };
    return defaultColors[roleName] ?? '#5865f2';
};

/**
 * Сортирует участников
 */
/* eslint-disable complexity -- Complex sorting logic with multiple cases */
export const sortMembers = (members: ServerMember[], sortBy: SortOption): ServerMember[] => {
    const sorted = [...members];

    sorted.sort((a, b) => {
        switch (sortBy) {
            case 'name': {
                const aNickname: string | undefined = a.nickname;
                const aUsername: string | undefined = a.user?.username;
                const nameA: string = (
                    aNickname != null && aNickname.length > 0 ? aNickname : (aUsername ?? '')
                ).toLowerCase();
                const bNickname: string | undefined = b.nickname;
                const bUsername: string | undefined = b.user?.username;
                const nameB: string = (
                    bNickname != null && bNickname.length > 0 ? bNickname : (bUsername ?? '')
                ).toLowerCase();
                return nameA.localeCompare(nameB);
            }
            case 'role': {
                const roleOrder: Record<string, number> = { owner: 0, admin: 1, moderator: 2, member: 3 };
                const aRole: 'member' | 'moderator' | 'admin' | 'owner' = a.role;
                const bRole: 'member' | 'moderator' | 'admin' | 'owner' = b.role;
                const roleA: number = roleOrder[aRole] ?? 4;
                const roleB: number = roleOrder[bRole] ?? 4;
                if (roleA !== roleB) {
                    return roleA - roleB;
                }
                // Если роли одинаковые, сортируем по имени
                const aNickname: string | undefined = a.nickname;
                const aUsername: string | undefined = a.user?.username;
                const nameA: string = (
                    aNickname != null && aNickname.length > 0 ? aNickname : (aUsername ?? '')
                ).toLowerCase();
                const bNickname: string | undefined = b.nickname;
                const bUsername: string | undefined = b.user?.username;
                const nameB: string = (
                    bNickname != null && bNickname.length > 0 ? bNickname : (bUsername ?? '')
                ).toLowerCase();
                return nameA.localeCompare(nameB);
            }
            case 'joined': {
                const aCreatedAt: string = a.createdAt;
                const bCreatedAt: string = b.createdAt;
                const aTime: number =
                    typeof aCreatedAt === 'string' || aCreatedAt instanceof Date ? new Date(aCreatedAt).getTime() : 0;
                const bTime: number =
                    typeof bCreatedAt === 'string' || bCreatedAt instanceof Date ? new Date(bCreatedAt).getTime() : 0;
                return aTime - bTime;
            }
            default:
                return 0;
        }
    });

    return sorted;
};

/**
 * Группирует участников по ролям
 */
export const groupMembersByRole = (members: ServerMember[], roles: Role[]): GroupedMembers[] => {
    const groups: Record<string, ServerMember[]> = {};

    members.forEach((member) => {
        const memberRole: 'member' | 'moderator' | 'admin' | 'owner' = member.role;
        const highestRoleName: string | undefined = member.highestRole?.name;
        const groupKey: string = memberRole === 'owner' ? 'owner' : (highestRoleName ?? memberRole ?? 'member');

        groups[groupKey] ??= [];
        groups[groupKey]?.push(member);
    });

    // Сортируем группы: сначала владельцы, потом по позиции ролей
    const sortedGroups = Object.entries(groups)
        .map(([groupName, groupMembers]): GroupedMembers => {
            const groupRole: Role | undefined = roles.find((r) => r.name === groupName);
            const groupColor: string = groupRole?.color ?? getDefaultRoleColor(groupName);

            return {
                groupName,
                groupMembers,
                groupColor
            };
        })
        .sort((a, b) => {
            if (a.groupName === 'owner') {
                return -1;
            }
            if (b.groupName === 'owner') {
                return 1;
            }

            const roleA: Role | undefined = roles.find((r) => r.name === a.groupName);
            const roleB: Role | undefined = roles.find((r) => r.name === b.groupName);

            if (roleA != null && roleB != null) {
                const roleAPosition: number = roleA.position;
                const roleBPosition: number = roleB.position;
                return roleBPosition - roleAPosition;
            }
            return a.groupName.localeCompare(b.groupName);
        });

    return sortedGroups;
};

/**
 * Вычисляет отфильтрованных и отсортированных участников
 */
export const processMembers = (
    members: ServerMember[],
    searchQuery: string,
    sortBy: SortOption,
    filterBy: FilterOption
): ServerMember[] => {
    let processed = filterBySearch(members, searchQuery);
    processed = filterByRole(processed, filterBy);
    processed = sortMembers(processed, sortBy);
    return processed;
};
