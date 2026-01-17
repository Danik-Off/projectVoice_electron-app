import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { MemberRowProps } from '../../types';
import type { Role } from '../../../../../../types/role';
import { useMemberActions } from '../../hooks/useMemberActions';
import { getHighestRoleColor, getMemberRoles, getMemberDisplayName, getRoleDisplayText } from '../../utils/memberUtils';
import './MemberRow.scss';

/* eslint-disable max-lines-per-function -- Complex member row component */
/* eslint-disable complexity -- Complex member row logic with multiple actions */
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
    const memberRolesResult = getMemberRoles(member, roles as Role[]);
    const memberRoles: Role[] = Array.isArray(memberRolesResult) ? memberRolesResult : [];
    const roleColor = getHighestRoleColor(member);
    const displayName = getMemberDisplayName(member);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest('.action-btn')) {
                return;
            }

            if (canManageRoles === true && isCurrentUser === false && onManageRoles != null) {
                onManageRoles(member);
            }
        },
        [canManageRoles, isCurrentUser, onManageRoles, member]
    );

    const handleContextMenuClick = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
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
                            src={member.user?.profilePicture ?? '/default-avatar.png'}
                            alt={member.user?.username ?? ''}
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
                        <span className="member-name" style={{ color: roleColor ?? '' }}>
                            {displayName}
                        </span>
                        {member.nickname != null && member.nickname.length > 0 ? (
                            <span className="member-username">@{member.user?.username ?? ''}</span>
                        ) : null}
                    </div>

                    <div className="member-roles-section">
                        {memberRoles.length > 0 ? (
                            <div className="roles-badges">
                                {memberRoles.map((roleItem: Role) => {
                                    if (
                                        roleItem == null ||
                                        typeof roleItem !== 'object' ||
                                        !('id' in roleItem) ||
                                        !('name' in roleItem)
                                    ) {
                                        return null;
                                    }
                                    const safeRole = roleItem;
                                    const roleColorValue: string | undefined = safeRole.color;
                                    const roleId: number = safeRole.id;
                                    const roleName: string = safeRole.name;
                                    const backgroundColor =
                                        roleColorValue != null && roleColorValue.length > 0
                                            ? `${roleColorValue}20`
                                            : 'rgba(88, 101, 242, 0.2)';
                                    const textColor = roleColorValue ?? '#5865f2';
                                    const borderColor = roleColorValue ?? '#5865f2';
                                    return (
                                        <span
                                            key={roleId}
                                            className="role-badge"
                                            style={{
                                                backgroundColor,
                                                color: textColor,
                                                borderColor
                                            }}
                                        >
                                            {roleName}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="member-role-text">{getRoleDisplayText(member.role)}</span>
                        )}
                    </div>
                </div>

                <div className="member-actions-section">
                    {showActions && hasModerationRights && !isCurrentUser ? (
                        <div className="quick-actions">
                            {canManageRoles === true ? (
                                <button
                                    className="action-btn manage-roles"
                                    onClick={() => {
                                        onManageRoles(member);
                                    }}
                                    title={t('serverSettings.manageRoles') ?? 'Управление ролями'}
                                >
                                    🎭
                                </button>
                            ) : null}
                            {canMute === true ? (
                                <button
                                    className={`action-btn mute ${isMuted === true ? 'active' : ''}`}
                                    onClick={() => {
                                        handleMuteToggle().catch((error: unknown) => {
                                            console.error('Error in handleMuteToggle:', error);
                                        });
                                    }}
                                    title={
                                        isMuted === true
                                            ? (t('serverMembers.unmute') ?? 'Разглушить')
                                            : (t('serverMembers.mute') ?? 'Заглушить')
                                    }
                                >
                                    {isMuted === true ? '🔊' : '🔇'}
                                </button>
                            ) : null}
                            {canDeafen === true ? (
                                <button
                                    className={`action-btn deafen ${isDeafened === true ? 'active' : ''}`}
                                    onClick={() => {
                                        handleDeafenToggle().catch((error: unknown) => {
                                            console.error('Error in handleDeafenToggle:', error);
                                        });
                                    }}
                                    title={
                                        isDeafened === true
                                            ? (t('serverMembers.undeafen') ?? 'Включить звук')
                                            : (t('serverMembers.deafen') ?? 'Отключить звук')
                                    }
                                >
                                    {isDeafened === true ? '🔊' : '🔉'}
                                </button>
                            ) : null}
                            {canKick === true ? (
                                <button
                                    className="action-btn kick"
                                    onClick={() => {
                                        handleKick().catch((error: unknown) => {
                                            console.error('Error in handleKick:', error);
                                        });
                                    }}
                                    title={t('serverMembers.kick') ?? 'Исключить'}
                                >
                                    👢
                                </button>
                            ) : null}
                            {canBan === true ? (
                                <button
                                    className="action-btn ban"
                                    onClick={() => {
                                        handleBan().catch((error: unknown) => {
                                            console.error('Error in handleBan:', error);
                                        });
                                    }}
                                    title={t('serverMembers.ban') ?? 'Забанить'}
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
