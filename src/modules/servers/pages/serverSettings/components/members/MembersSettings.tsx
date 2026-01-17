import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import MemberRow from './components/MemberRow';
import MemberRolesModal from './components/MemberRolesModal';
import MemberSearch from './components/MemberSearch';
import MemberFilters from './components/MemberFilters';
import MemberContextMenu from '../../../../components/MemberContextMenu';
import { useMembersSettings } from './hooks/useMembersSettings';
import type { MembersSettingsProps } from './types';
import './MembersSettings.scss';

const MembersSettings: React.FC<MembersSettingsProps> = observer(({ currentUserPermissions = 0n }) => {
    const { t } = useTranslation();
    const {
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
        setSearchQuery,
        setSortBy,
        setFilterBy,
        setSelectedMemberForRoles,
        loadMembers,
        handleContextMenu,
        closeContextMenu,
        handleMemberUpdate
    } = useMembersSettings(currentUserPermissions);

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
                            <MemberSearch
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder={t('serverSettings.searchMembers') || 'Поиск участников...'}
                            />

                            <MemberFilters
                                sortBy={sortBy}
                                filterBy={filterBy}
                                onSortChange={setSortBy}
                                onFilterChange={setFilterBy}
                                filteredCount={filteredAndSortedMembers.length}
                                totalCount={members.length}
                            />
                        </div>

                        {/* Список участников с группировкой */}
                        <div className="members-list-container">
                            {filteredAndSortedMembers.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <h3>{t('serverSettings.noMembersFound') || 'Участники не найдены'}</h3>
                                    <p>
                                        {t('serverSettings.tryDifferentSearch') ||
                                            'Попробуйте изменить параметры поиска или фильтра'}
                                    </p>
                                </div>
                            ) : (
                                groupedMembers.map(({ groupName, groupMembers, groupColor }) => (
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
                                            {groupMembers.map((member) => (
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
                                ))
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
                    onClose={closeContextMenu}
                    onMemberUpdate={handleMemberUpdate}
                    position={contextMenu.position}
                />
            )}
        </div>
    );
});

export default MembersSettings;
