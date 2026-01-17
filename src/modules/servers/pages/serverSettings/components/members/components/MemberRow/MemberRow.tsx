import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { MemberRowProps } from '../../types';
import { useMemberActions } from '../../hooks/useMemberActions';
import { getHighestRoleColor, getMemberRoles, getMemberDisplayName, getRoleDisplayText } from '../../utils/memberUtils';
import './MemberRow.scss';

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
    const [showActions, setShowActions] = useState(false);

    const {
        isMuted,
        isDeafened,
        canKick,
        canBan,
        canMute,
        canDeafen,
        canManageRoles,
        handleKick,
        handleBan,
        handleMuteToggle,
        handleDeafenToggle
    } = useMemberActions({
        member,
        serverId,
        currentUserPermissions,
        onUpdate
    });

    const isCurrentUser = member.userId === currentUserId;
    const hasModerationRights = canKick || canBan || canMute || canDeafen || canManageRoles;
    const memberRoles = getMemberRoles(member, roles);
    const roleColor = getHighestRoleColor(member);
    const displayName = getMemberDisplayName(member);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest('.action-btn')) {
                return;
            }

            if (canManageRoles && !isCurrentUser && onManageRoles) {
                onManageRoles(member);
            }
        },
        [canManageRoles, isCurrentUser, onManageRoles, member]
    );

    const handleContextMenuClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isCurrentUser || !hasModerationRights || !onContextMenu) {
                return;
            }

            onContextMenu(e, member);
        },
        [isCurrentUser, hasModerationRights, onContextMenu, member]
    );

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
                            <span className="owner-badge" title={t('serverMembers.owner') || 'Владелец'}>
                                👑
                            </span>
                        )}
                    </div>
                </div>

                <div className="member-info-section">
                    <div className="member-name-section">
                        <span className="member-name" style={{ color: roleColor }}>
                            {displayName}
                        </span>
                        {member.nickname ? <span className="member-username">@{member.user?.username}</span> : null}
                    </div>

                    <div className="member-roles-section">
                        {memberRoles.length > 0 ? (
                            <div className="roles-badges">
                                {memberRoles.map((role) => (
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
                            <span className="member-role-text">{getRoleDisplayText(member.role)}</span>
                        )}
                    </div>
                </div>

                <div className="member-actions-section">
                    {showActions && hasModerationRights && !isCurrentUser ? (
                        <div className="quick-actions">
                            {canManageRoles ? (
                                <button
                                    className="action-btn manage-roles"
                                    onClick={() => onManageRoles(member)}
                                    title={t('serverSettings.manageRoles') || 'Управление ролями'}
                                >
                                    🎭
                                </button>
                            ) : null}
                            {canMute ? (
                                <button
                                    className={`action-btn mute ${isMuted ? 'active' : ''}`}
                                    onClick={handleMuteToggle}
                                    title={
                                        isMuted
                                            ? t('serverMembers.unmute') || 'Разглушить'
                                            : t('serverMembers.mute') || 'Заглушить'
                                    }
                                >
                                    {isMuted ? '🔊' : '🔇'}
                                </button>
                            ) : null}
                            {canDeafen ? (
                                <button
                                    className={`action-btn deafen ${isDeafened ? 'active' : ''}`}
                                    onClick={handleDeafenToggle}
                                    title={
                                        isDeafened
                                            ? t('serverMembers.undeafen') || 'Включить звук'
                                            : t('serverMembers.deafen') || 'Отключить звук'
                                    }
                                >
                                    {isDeafened ? '🔊' : '🔉'}
                                </button>
                            ) : null}
                            {canKick ? (
                                <button
                                    className="action-btn kick"
                                    onClick={handleKick}
                                    title={t('serverMembers.kick') || 'Исключить'}
                                >
                                    👢
                                </button>
                            ) : null}
                            {canBan ? (
                                <button
                                    className="action-btn ban"
                                    onClick={handleBan}
                                    title={t('serverMembers.ban') || 'Забанить'}
                                >
                                    🔨
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MemberRow;
