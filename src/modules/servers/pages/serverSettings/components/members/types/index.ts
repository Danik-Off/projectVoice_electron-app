import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';

// Props types
export interface MembersSettingsProps {
    currentUserPermissions?: string | bigint;
}

export interface MemberRowProps {
    member: ServerMember;
    serverId: number;
    roles: Role[];
    currentUserPermissions: string | bigint;
    currentUserId?: number;
    onUpdate: () => void;
    onManageRoles: (member: ServerMember) => void;
    onContextMenu?: (e: React.MouseEvent, member: ServerMember) => void;
}

export interface MemberRolesModalProps {
    isOpen: boolean;
    member: ServerMember | null;
    serverId: number;
    roles: Role[];
    onClose: () => void;
    onUpdate: () => void;
}

export interface MemberSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface MemberFiltersProps {
    sortBy: SortOption;
    filterBy: FilterOption;
    onSortChange: (sort: SortOption) => void;
    onFilterChange: (filter: FilterOption) => void;
    filteredCount: number;
    totalCount: number;
}

// State types
export type SortOption = 'name' | 'role' | 'joined';
export type FilterOption = 'all' | 'owner' | 'admin' | 'moderator' | 'member';

export interface ContextMenuState {
    member: ServerMember;
    position: { x: number; y: number };
}

export interface GroupedMembers {
    groupName: string;
    groupMembers: ServerMember[];
    groupColor?: string;
}
