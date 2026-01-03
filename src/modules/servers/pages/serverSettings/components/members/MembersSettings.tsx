import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { serverMembersService } from '../../../../../../modules/servers';
import { roleService } from '../../../../services/roleService';
import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';
import MemberRow from './MemberRow';
import MemberRolesModal from './MemberRolesModal';
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
    const [members, setMembers] = useState<ServerMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [selectedMemberForRoles, setSelectedMemberForRoles] = useState<ServerMember | null>(null);
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

    useEffect(() => {
        loadMembers();
        loadRoles();
    }, [loadMembers, loadRoles]);

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
                case 'name': {
                    const nameA = (a.nickname || a.user?.username || '').toLowerCase();
                    const nameB = (b.nickname || b.user?.username || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                }
                case 'role': {
                    const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
                    const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
                    const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 4;
                    if (roleA !== roleB) return roleA - roleB;
                    // Если роли одинаковые, сортируем по имени
                    const nameA2 = (a.nickname || a.user?.username || '').toLowerCase();
                    const nameB2 = (b.nickname || b.user?.username || '').toLowerCase();
                    return nameA2.localeCompare(nameB2);
                }
                case 'joined':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [members, searchQuery, sortBy, filterBy]);

    // Группировка участников по ролям для лучшей визуализации
    const groupedMembers = useMemo(() => {
        const groups: Record<string, ServerMember[]> = {};
        
        filteredAndSortedMembers.forEach(member => {
            const groupKey = member.role === 'owner' ? 'owner' : 
                           member.highestRole?.name || member.role;
            
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(member);
        });

        // Сортируем группы: сначала владельцы, потом по позиции ролей
        const sortedGroups = Object.entries(groups).sort(([keyA], [keyB]) => {
            if (keyA === 'owner') return -1;
            if (keyB === 'owner') return 1;
            
            const roleA = roles.find(r => r.name === keyA);
            const roleB = roles.find(r => r.name === keyB);
            
            if (roleA && roleB) {
                return roleB.position - roleA.position;
            }
            return keyA.localeCompare(keyB);
        });

        return sortedGroups;
    }, [filteredAndSortedMembers, roles]);

    const handleContextMenu = useCallback((e: React.MouseEvent, member: ServerMember) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Не показываем меню для себя
        if (member.userId === currentUser?.id) {
            return;
        }
        
        if (!server?.id) {
            return;
        }
        
        // Убеждаемся, что позиция корректна
        const x = Math.min(e.clientX, window.innerWidth - 250); // Оставляем место для меню
        const y = Math.min(e.clientY, window.innerHeight - 200); // Оставляем место для меню
        
        setContextMenu({
            member,
            position: { x, y }
        });
    }, [currentUser?.id, server?.id]);

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2>{t('serverSettings.members')}</h2>
                <p>{t('serverSettings.membersDescription')}</p>
            </div>
            
            <div className="section-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>{t('serverSettings.loadingMembers')}</p>
                    </div>
                ) : (
                    <div className="members-management-container">
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
                            
                            <div className="controls-row">
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
                                        <option value="member">{t('serverSettings.membersFilter') || 'Участники'}</option>
                                    </select>
                                </div>
                                
                                <div className="members-count-badge">
                                    <span className="count-number">{filteredAndSortedMembers.length}</span>
                                    <span className="count-total">/ {members.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Список участников с группировкой */}
                        <div className="members-list-container">
                            {filteredAndSortedMembers.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <h3>{t('serverSettings.noMembersFound') || 'Участники не найдены'}</h3>
                                    <p>{t('serverSettings.tryDifferentSearch') || 'Попробуйте изменить параметры поиска или фильтра'}</p>
                                </div>
                            ) : (
                                groupedMembers.map(([groupName, groupMembers]) => {
                                    const groupRole = roles.find(r => r.name === groupName);
                                    const groupColor = groupRole?.color || 
                                        (groupName === 'owner' ? '#faa61a' : 
                                         groupName === 'admin' ? '#ed4245' : 
                                         groupName === 'moderator' ? '#5865f2' : undefined);

                                    return (
                                        <div key={groupName} className="members-group">
                                            <div className="group-header">
                                                <div 
                                                    className="group-color-bar"
                                                    style={{ backgroundColor: groupColor || '#5865f2' }}
                                                />
                                                <h3 className="group-title">{groupName}</h3>
                                                <span className="group-count">({groupMembers.length})</span>
                                            </div>
                                            <div className="group-members">
                                                {groupMembers.map(member => (
                                                    <MemberRow
                                                        key={member.id}
                                                        member={member}
                                                        serverId={server?.id || 0}
                                                        roles={roles}
                                                        currentUserPermissions={currentUserPermissions}
                                                        currentUserId={currentUser?.id}
                                                        onUpdate={loadMembers}
                                                        onManageRoles={setSelectedMemberForRoles}
                                                        onContextMenu={handleContextMenu}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {selectedMemberForRoles && server?.id && (
                <MemberRolesModal
                    isOpen={!!selectedMemberForRoles}
                    member={selectedMemberForRoles}
                    serverId={server.id}
                    roles={roles}
                    onClose={() => setSelectedMemberForRoles(null)}
                    onUpdate={loadMembers}
                />
            )}
            
            {contextMenu && server?.id && (
                <MemberContextMenu
                    key={`context-menu-${contextMenu.member.id}`}
                    member={contextMenu.member}
                    serverId={server.id}
                    currentUserPermissions={currentUserPermissions}
                    onClose={() => {
                        setContextMenu(null);
                    }}
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
