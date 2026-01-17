import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';
import type { SortOption, FilterOption, GroupedMembers } from '../types';

/**
 * Фильтрует участников по поисковому запросу
 */
export const filterBySearch = (members: ServerMember[], query: string): ServerMember[] => {
    if (!query.trim()) {
        return members;
    }

    const lowerQuery = query.toLowerCase();
    return members.filter((member) => {
        const username = member.user?.username?.toLowerCase() || '';
        const nickname = member.nickname?.toLowerCase() || '';
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
 * Сортирует участников
 */
export const sortMembers = (members: ServerMember[], sortBy: SortOption): ServerMember[] => {
    const sorted = [...members];

    sorted.sort((a, b) => {
        switch (sortBy) {
            case 'name': {
                const nameA = (a.nickname || a.user?.username || '').toLowerCase();
                const nameB = (b.nickname || b.user?.username || '').toLowerCase();
                return nameA.localeCompare(nameB);
            }
            case 'role': {
                const roleOrder: Record<string, number> = { owner: 0, admin: 1, moderator: 2, member: 3 };
                const roleA = roleOrder[a.role] ?? 4;
                const roleB = roleOrder[b.role] ?? 4;
                if (roleA !== roleB) {
                    return roleA - roleB;
                }
                // Если роли одинаковые, сортируем по имени
                const nameA = (a.nickname || a.user?.username || '').toLowerCase();
                const nameB = (b.nickname || b.user?.username || '').toLowerCase();
                return nameA.localeCompare(nameB);
            }
            case 'joined':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
        const groupKey = member.role === 'owner' ? 'owner' : member.highestRole?.name || member.role;

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(member);
    });

    // Сортируем группы: сначала владельцы, потом по позиции ролей
    const sortedGroups = Object.entries(groups)
        .map(([groupName, groupMembers]): GroupedMembers => {
            const groupRole = roles.find((r) => r.name === groupName);
            const groupColor = groupRole?.color || getDefaultRoleColor(groupName);

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

            const roleA = roles.find((r) => r.name === a.groupName);
            const roleB = roles.find((r) => r.name === b.groupName);

            if (roleA && roleB) {
                return roleB.position - roleA.position;
            }
            return a.groupName.localeCompare(b.groupName);
        });

    return sortedGroups;
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
    return defaultColors[roleName] || '#5865f2';
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
