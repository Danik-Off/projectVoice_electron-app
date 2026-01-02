import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverMembersService, Permissions, hasPermission } from '../../../../../../modules/servers';
import { roleService } from '../../../../services/roleService';
import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';
import ServerMembers from '../../../channelPage/components/channelSidebar/components/serverMembers/ServerMembers';
import MemberRoleManager from './MemberRoleManager';
import { serverStore } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';

interface MembersSettingsProps {
    currentUserPermissions?: string | bigint;
}

const MembersSettings: React.FC<MembersSettingsProps> = observer(({ 
    currentUserPermissions = 0n 
}) => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [members, setMembers] = useState<ServerMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ServerMember | null>(null);

    const server = serverStore.currentServer;

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
                                <div className="members-management">
                                    <div className="members-list-section">
                                        <h4>{t('serverSettings.membersList') || 'Список участников'}</h4>
                                        <div className="members-list">
                                            {members.map(member => (
                                                <div
                                                    key={member.id}
                                                    className={`member-item ${selectedMember?.id === member.id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedMember(member)}
                                                >
                                                    {member.user && (
                                                        <>
                                                            <img
                                                                src={member.user.profilePicture || '/default-avatar.png'}
                                                                alt={member.user.username}
                                                                className="member-avatar"
                                                            />
                                                            <div className="member-info">
                                                                <span 
                                                                    className="member-name"
                                                                    style={{
                                                                        color: member.highestRole?.color
                                                                    }}
                                                                >
                                                                    {member.nickname || member.user.username}
                                                                    {member.role === 'owner' && (
                                                                        <span className="owner-badge" title={t('serverMembers.owner') || 'Владелец'}>👑</span>
                                                                    )}
                                                                </span>
                                                                <span className="member-role">
                                                                    {member.highestRole?.name || member.role}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
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
                                            <p>{t('serverSettings.selectMemberToManageRoles') || 'Выберите участника для управления ролями'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MembersSettings;
