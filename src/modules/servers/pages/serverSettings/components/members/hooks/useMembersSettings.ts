import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService, serverStore, roleService } from '../../../../../';
import { notificationStore, authStore } from '../../../../../../../core';
import type { ServerMember } from '../../../../../';
import type { Role } from '../../../../../types/role';
import type { SortOption, FilterOption, ContextMenuState } from '../types';
import { processMembers, groupMembersByRole } from '../utils/membersUtils';

export const useMembersSettings = (currentUserPermissions: string | bigint = 0n) => {
    const { t } = useTranslation();
    const [members, setMembers] = useState<ServerMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [selectedMemberForRoles, setSelectedMemberForRoles] = useState<ServerMember | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const server = serverStore.currentServer;
    const currentUser = authStore.user;

    const loadMembers = useCallback(async () => {
        if (!server?.id) {
            return;
        }

        setLoading(true);
        try {
            const membersData = await serverMembersService.getServerMembers(server.id);
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading members:', error);
            notificationStore.addNotification(
                t('serverSettings.membersLoadError') || 'Ошибка загрузки участников',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [server?.id, t]);

    const loadRoles = useCallback(async () => {
        if (!server?.id) {
            return;
        }

        try {
            const rolesData = await roleService.getRoles(server.id);
            const sortedRoles = [...rolesData].sort((a, b) => b.position - a.position);
            setRoles(sortedRoles);
        } catch (error) {
            console.error('Error loading roles:', error);
            notificationStore.addNotification(t('serverSettings.rolesLoadError') || 'Ошибка загрузки ролей', 'error');
        }
    }, [server?.id, t]);

    useEffect(() => {
        loadMembers();
        loadRoles();
    }, [loadMembers, loadRoles]);

    const filteredAndSortedMembers = useMemo(
        () => processMembers(members, searchQuery, sortBy, filterBy),
        [members, searchQuery, sortBy, filterBy]
    );

    const groupedMembers = useMemo(
        () => groupMembersByRole(filteredAndSortedMembers, roles),
        [filteredAndSortedMembers, roles]
    );

    const handleContextMenu = useCallback(
        (e: React.MouseEvent, member: ServerMember) => {
            e.preventDefault();
            e.stopPropagation();

            if (member.userId === currentUser?.id || !server?.id) {
                return;
            }

            const x = Math.min(e.clientX, window.innerWidth - 250);
            const y = Math.min(e.clientY, window.innerHeight - 200);

            setContextMenu({ member, position: { x, y } });
        },
        [currentUser?.id, server?.id]
    );

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const handleMemberUpdate = useCallback(() => {
        loadMembers();
        setContextMenu(null);
    }, [loadMembers]);

    return {
        // State
        members,
        roles,
        loading,
        searchQuery,
        sortBy,
        filterBy,
        selectedMemberForRoles,
        contextMenu,
        filteredAndSortedMembers,
        groupedMembers,
        server,
        currentUser,
        currentUserPermissions,

        // Actions
        setSearchQuery,
        setSortBy,
        setFilterBy,
        setSelectedMemberForRoles,
        loadMembers,
        handleContextMenu,
        closeContextMenu,
        handleMemberUpdate
    };
};
