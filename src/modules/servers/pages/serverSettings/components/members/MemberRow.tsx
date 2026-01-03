import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService, Permissions, hasPermission } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import type { ServerMember } from '../../../../../../modules/servers';
import type { Role } from '../../../../types/role';
import './MemberRow.scss';

interface MemberRowProps {
    member: ServerMember;
    serverId: number;
    roles: Role[];
    currentUserPermissions: string | bigint;
    currentUserId?: number;
    onUpdate: () => void;
    onManageRoles: (member: ServerMember) => void;
    onContextMenu?: (e: React.MouseEvent, member: ServerMember) => void;
}

const MemberRow: React.FC<MemberRowProps> = ({
    member,
    serverId,
    roles,
    currentUserPermissions,
    currentUserId,
    onUpdate,
    onManageRoles,
    onContextMenu
}) => {
    const { t } = useTranslation();
    const [isMuted, setIsMuted] = useState(member.isMuted || false);
    const [isDeafened, setIsDeafened] = useState(member.isDeafened || false);
    const [showActions, setShowActions] = useState(false);

    const canKick = hasPermission(currentUserPermissions, Permissions.KICK_MEMBERS);
    const canBan = hasPermission(currentUserPermissions, Permissions.BAN_MEMBERS);
    const canMute = hasPermission(currentUserPermissions, Permissions.MUTE_MEMBERS);
    const canDeafen = hasPermission(currentUserPermissions, Permissions.DEAFEN_MEMBERS);
    const canManageRoles = hasPermission(currentUserPermissions, Permissions.MANAGE_ROLES);

    const isCurrentUser = member.userId === currentUserId;
    const hasModerationRights = canKick || canBan || canMute || canDeafen || canManageRoles;

    // Получаем цвет самой высокой роли
    const getHighestRoleColor = (): string | undefined => {
        if (member.highestRole?.color) {
            return member.highestRole.color;
        }
        if (member.role === 'owner') return '#faa61a';
        if (member.role === 'admin') return '#ed4245';
        if (member.role === 'moderator') return '#5865f2';
        return undefined;
    };

    // Получаем все роли участника
    const memberRoles = member.roles 
        ? roles.filter(r => member.roles!.some((mr: Role | number) => (typeof mr === 'object' ? mr.id : mr) === r.id))
        : [];

    const handleKick = async () => {
        if (!confirm(t('serverMembers.kickConfirm') || `Вы уверены, что хотите исключить ${member.nickname || member.user?.username}?`)) {
            return;
        }
        try {
            await serverMembersService.kickMember(serverId, member.id);
            notificationStore.addNotification(
                t('serverMembers.memberKicked') || 'Участник исключен',
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error kicking member:', error);
            notificationStore.addNotification(
                t('serverMembers.kickError') || 'Ошибка при исключении участника',
                'error'
            );
        }
    };

    const handleBan = async () => {
        const reason = prompt(t('serverMembers.banReason') || 'Причина бана (необязательно):');
        try {
            await serverMembersService.banMember(serverId, member.id, reason || undefined);
            notificationStore.addNotification(
                t('serverMembers.memberBanned') || 'Участник забанен',
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error banning member:', error);
            notificationStore.addNotification(
                t('serverMembers.banError') || 'Ошибка при бане участника',
                'error'
            );
        }
    };

    const handleMuteToggle = async () => {
        try {
            const newMuted = !isMuted;
            await serverMembersService.updateVoiceSettings(serverId, member.id, newMuted, isDeafened);
            setIsMuted(newMuted);
            notificationStore.addNotification(
                newMuted 
                    ? (t('serverMembers.memberMuted') || 'Участник заглушен')
                    : (t('serverMembers.memberUnmuted') || 'Участник разглушен'),
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error toggling mute:', error);
        }
    };

    const handleDeafenToggle = async () => {
        try {
            const newDeafened = !isDeafened;
            await serverMembersService.updateVoiceSettings(serverId, member.id, isMuted, newDeafened);
            setIsDeafened(newDeafened);
            notificationStore.addNotification(
                newDeafened
                    ? (t('serverMembers.memberDeafened') || 'Участнику отключен звук')
                    : (t('serverMembers.memberUndeafened') || 'Участнику включен звук'),
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error toggling deafen:', error);
        }
    };

    const handleClick = useCallback((e: React.MouseEvent) => {
        // Если клик по кнопке действия, не открываем контекстное меню
        if ((e.target as HTMLElement).closest('.action-btn')) {
            return;
        }
        
        // Если есть права на управление ролями и это не текущий пользователь, открываем модальное окно
        if (canManageRoles && !isCurrentUser && onManageRoles) {
            onManageRoles(member);
        }
    }, [canManageRoles, isCurrentUser, onManageRoles, member]);

    const handleContextMenuClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Не показываем меню для себя
        if (isCurrentUser) {
            return;
        }
        
        // Проверяем, есть ли хотя бы одно право на модерацию
        if (!hasModerationRights) {
            return;
        }
        
        if (onContextMenu) {
            onContextMenu(e, member);
        }
    }, [isCurrentUser, hasModerationRights, onContextMenu, member]);

    return (
        <div 
            className={`member-row ${isCurrentUser ? 'current-user' : ''} ${canManageRoles && !isCurrentUser ? 'clickable' : ''}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            onClick={handleClick}
            onContextMenu={handleContextMenuClick}
        >
            <div className="member-row-main">
                <div className="member-avatar-section">
                    <div className="avatar-wrapper">
                        <img
                            src={member.user?.profilePicture || '/default-avatar.png'}
                            alt={member.user?.username}
                            className="member-avatar"
                        />
                        {member.role === 'owner' && (
                            <span className="owner-badge" title={t('serverMembers.owner') || 'Владелец'}>👑</span>
                        )}
                    </div>
                </div>

                <div className="member-info-section">
                    <div className="member-name-section">
                        <span 
                            className="member-name"
                            style={{ color: getHighestRoleColor() }}
                        >
                            {member.nickname || member.user?.username}
                        </span>
                        {member.nickname && (
                            <span className="member-username">
                                @{member.user?.username}
                            </span>
                        )}
                    </div>

                    <div className="member-roles-section">
                        {memberRoles.length > 0 ? (
                            <div className="roles-badges">
                                {memberRoles.map(role => (
                                    <span
                                        key={role.id}
                                        className="role-badge"
                                        style={{ 
                                            backgroundColor: role.color ? `${role.color}20` : 'rgba(88, 101, 242, 0.2)',
                                            color: role.color || '#5865f2',
                                            borderColor: role.color || '#5865f2'
                                        }}
                                    >
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="member-role-text">
                                {member.role === 'owner' ? '👑 Владелец' :
                                 member.role === 'admin' ? '⚡ Администратор' :
                                 member.role === 'moderator' ? '🛡️ Модератор' :
                                 '👤 Участник'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="member-actions-section">
                    {showActions && hasModerationRights && !isCurrentUser && (
                        <div className="quick-actions">
                            {canManageRoles && (
                                <button
                                    className="action-btn manage-roles"
                                    onClick={() => onManageRoles(member)}
                                    title={t('serverSettings.manageRoles') || 'Управление ролями'}
                                >
                                    🎭
                                </button>
                            )}
                            {canMute && (
                                <button
                                    className={`action-btn mute ${isMuted ? 'active' : ''}`}
                                    onClick={handleMuteToggle}
                                    title={isMuted ? (t('serverMembers.unmute') || 'Разглушить') : (t('serverMembers.mute') || 'Заглушить')}
                                >
                                    {isMuted ? '🔊' : '🔇'}
                                </button>
                            )}
                            {canDeafen && (
                                <button
                                    className={`action-btn deafen ${isDeafened ? 'active' : ''}`}
                                    onClick={handleDeafenToggle}
                                    title={isDeafened ? (t('serverMembers.undeafen') || 'Включить звук') : (t('serverMembers.deafen') || 'Отключить звук')}
                                >
                                    {isDeafened ? '🔊' : '🔉'}
                                </button>
                            )}
                            {canKick && (
                                <button
                                    className="action-btn kick"
                                    onClick={handleKick}
                                    title={t('serverMembers.kick') || 'Исключить'}
                                >
                                    👢
                                </button>
                            )}
                            {canBan && (
                                <button
                                    className="action-btn ban"
                                    onClick={handleBan}
                                    title={t('serverMembers.ban') || 'Забанить'}
                                >
                                    🔨
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberRow;

