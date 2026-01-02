import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverMembersService, Permissions, hasPermission } from '../../../../../../modules/servers';
import { roleService } from '../../../../services/roleService';
import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';
import MemberRoleManager from './MemberRoleManager';
import MemberContextMenu from '../../../../components/MemberContextMenu';
import { serverStore } from '../../../../../../modules/servers';
import { notificationStore, authStore } from '../../../../../../core';
import './MembersSettings.scss';

interface MembersSettingsProps {
    currentUserPermissions?: string | bigint;
}

type SortOption = 'name' | 'role' | 'joined';
type FilterOption = 'all' | 'owner' | 'admin' | 'moderator' | 'member';

const MembersSettings: React.FC<MembersSettingsProps> = observer(({ 
    currentUserPermissions = 0n 
}) => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [members, setMembers] = useState<ServerMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ServerMember | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [contextMenu, setContextMenu] = useState<{
        member: ServerMember;
        position: { x: number; y: number };
    } | null>(null);

    const server = serverStore.currentServer;
    const currentUser = authStore.user;

    const loadMembers = useCallback(async () => {
        if (!server?.id) return;
        
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
        if (!server?.id) return;
        
        try {
            // Загружаем все роли с бэкенда (уже отсортированы по position)
            const rolesData = await roleService.getRoles(server.id);
            // Убеждаемся, что роли отсортированы по позиции (больше = выше)
            const sortedRoles = [...rolesData].sort((a, b) => b.position - a.position);
            setRoles(sortedRoles);
        } catch (error) {
            console.error('Error loading roles:', error);
            notificationStore.addNotification(
                t('serverSettings.rolesLoadError') || 'Ошибка загрузки ролей',
                'error'
            );
        }
    }, [server?.id, t]);


    const handleRemoveMember = async (memberId: number) => {
        if (!server?.id) return;
        
        try {
            await serverMembersService.removeMember(server.id, memberId);
            await loadMembers(); // Перезагружаем список участников
            
            notificationStore.addNotification(
                t('serverSettings.memberRemoved'),
                'success',
                3000
            );
        } catch (error) {
            console.error('Error removing member:', error);
            notificationStore.addNotification(
                t('serverSettings.memberRemoveError'),
                'error',
                5000
            );
        }
    };

    useEffect(() => {
        loadMembers();
        loadRoles();
    }, [loadMembers, loadRoles]);

    const handleRoleChange = () => {
        loadMembers();
    };

    // Фильтрация и сортировка участников
    const filteredAndSortedMembers = useMemo(() => {
        let filtered = [...members];

        // Фильтрация по поисковому запросу
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(member => {
                const username = member.user?.username?.toLowerCase() || '';
                const nickname = member.nickname?.toLowerCase() || '';
                return username.includes(query) || nickname.includes(query);
            });
        }

        // Фильтрация по роли
        if (filterBy !== 'all') {
            filtered = filtered.filter(member => member.role === filterBy);
        }

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = (a.nickname || a.user?.username || '').toLowerCase();
                    const nameB = (b.nickname || b.user?.username || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'role':
                    const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
                    const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
                    const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 4;
                    if (roleA !== roleB) return roleA - roleB;
                    // Если роли одинаковые, сортируем по имени
                    const nameA2 = (a.nickname || a.user?.username || '').toLowerCase();
                    const nameB2 = (b.nickname || b.user?.username || '').toLowerCase();
                    return nameA2.localeCompare(nameB2);
                case 'joined':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [members, searchQuery, sortBy, filterBy]);

    const handleContextMenu = useCallback((e: React.MouseEvent, member: ServerMember) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Не показываем меню для себя
        if (member.userId === currentUser?.id) return;
        
        setContextMenu({
            member,
            position: { x: e.clientX, y: e.clientY }
        });
    }, [currentUser?.id]);

    const canKick = hasPermission(currentUserPermissions, Permissions.KICK_MEMBERS);
    const canBan = hasPermission(currentUserPermissions, Permissions.BAN_MEMBERS);
    const canManageRoles = hasPermission(currentUserPermissions, Permissions.MANAGE_ROLES);

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2>{t('serverSettings.members')}</h2>
                <p>{t('serverSettings.membersDescription')}</p>
            </div>
            
            <div className="section-content">
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">
                                👥
                            </div>
                            <div className="header-text">
                                <h3>{t('serverSettings.serverMembers')}</h3>
                                <p>{t('serverSettings.serverMembersDescription')}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>{t('serverSettings.loadingMembers')}</p>
                            </div>
                        ) : (
                            <div className="members-settings-content">
                                {/* Панель управления */}
                                <div className="members-controls">
                                    <div className="search-box">
                                        <input
                                            type="text"
                                            placeholder={t('serverSettings.searchMembers') || 'Поиск участников...'}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                        <span className="search-icon">🔍</span>
                                    </div>
                                    
                                    <div className="filters-row">
                                        <div className="filter-group">
                                            <label>{t('serverSettings.sortBy') || 'Сортировать:'}</label>
                                            <select 
                                                value={sortBy} 
                                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                                className="filter-select"
                                            >
                                                <option value="name">{t('serverSettings.sortByName') || 'По имени'}</option>
                                                <option value="role">{t('serverSettings.sortByRole') || 'По роли'}</option>
                                                <option value="joined">{t('serverSettings.sortByJoined') || 'По дате вступления'}</option>
                                            </select>
                                        </div>
                                        
                                        <div className="filter-group">
                                            <label>{t('serverSettings.filterBy') || 'Фильтр:'}</label>
                                            <select 
                                                value={filterBy} 
                                                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                                className="filter-select"
                                            >
                                                <option value="all">{t('serverSettings.allMembers') || 'Все участники'}</option>
                                                <option value="owner">{t('serverSettings.owners') || 'Владельцы'}</option>
                                                <option value="admin">{t('serverSettings.admins') || 'Администраторы'}</option>
                                                <option value="moderator">{t('serverSettings.moderators') || 'Модераторы'}</option>
                                                <option value="member">{t('serverSettings.members') || 'Участники'}</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="members-count">
                                        {t('serverSettings.membersCount') || 'Участников'}: {filteredAndSortedMembers.length} / {members.length}
                                    </div>
                                </div>

                                <div className="members-management">
                                    <div className="members-list-section">
                                        <div className="members-list">
                                            {filteredAndSortedMembers.length === 0 ? (
                                                <div className="empty-members">
                                                    <p>{t('serverSettings.noMembersFound') || 'Участники не найдены'}</p>
                                                </div>
                                            ) : (
                                                filteredAndSortedMembers.map(member => (
                                                    <div
                                                        key={member.id}
                                                        className={`member-item ${selectedMember?.id === member.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedMember(member)}
                                                        onContextMenu={(e) => handleContextMenu(e, member)}
                                                    >
                                                        {member.user && (
                                                            <>
                                                                <div className="member-avatar-wrapper">
                                                                    <img
                                                                        src={member.user.profilePicture || '/default-avatar.png'}
                                                                        alt={member.user.username}
                                                                        className="member-avatar"
                                                                    />
                                                                    {member.role === 'owner' && (
                                                                        <span className="owner-indicator" title={t('serverMembers.owner') || 'Владелец'}>👑</span>
                                                                    )}
                                                                </div>
                                                                <div className="member-info">
                                                                    <div className="member-name-row">
                                                                        <span 
                                                                            className="member-name"
                                                                            style={{
                                                                                color: member.highestRole?.color
                                                                            }}
                                                                        >
                                                                            {member.nickname || member.user.username}
                                                                        </span>
                                                                        {(canKick || canBan || canManageRoles) && member.userId !== currentUser?.id && (
                                                                            <span className="actions-hint">ПКМ для действий</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="member-meta">
                                                                        <span className="member-role">
                                                                            {member.highestRole?.name || member.role}
                                                                        </span>
                                                                        {member.nickname && (
                                                                            <span className="member-username">
                                                                                @{member.user.username}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    
                                    {selectedMember && server?.id && (
                                        <div className="member-role-section">
                                            <div className="section-header-small">
                                                <h4>
                                                    {t('serverSettings.manageRolesFor') || 'Управление ролями для'}: {selectedMember.user?.username}
                                                </h4>
                                                <button
                                                    className="close-button"
                                                    onClick={() => setSelectedMember(null)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <MemberRoleManager
                                                member={selectedMember}
                                                serverId={server.id}
                                                roles={roles}
                                                onRoleChange={handleRoleChange}
                                            />
                                        </div>
                                    )}
                                    
                                    {!selectedMember && (
                                        <div className="select-member-hint">
                                            <div className="hint-icon">👆</div>
                                            <p>{t('serverSettings.selectMemberToManageRoles') || 'Выберите участника для управления ролями'}</p>
                                            <p className="hint-subtitle">
                                                {t('serverSettings.rightClickForActions') || 'Или используйте правый клик для быстрых действий'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {contextMenu && server?.id && (
                <MemberContextMenu
                    member={contextMenu.member}
                    serverId={server.id}
                    currentUserPermissions={currentUserPermissions}
                    onClose={() => setContextMenu(null)}
                    onMemberUpdate={() => {
                        loadMembers();
                        setContextMenu(null);
                    }}
                    position={contextMenu.position}
                />
            )}
        </div>
    );
});

export default MembersSettings;
