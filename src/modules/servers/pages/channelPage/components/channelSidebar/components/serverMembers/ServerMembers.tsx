import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

import './ServerMembers.scss';
import { useUserProfile } from '../../../../../../../../components';
import { authStore } from '../../../../../../../../core';
import { ClickableAvatar } from '../../../../../../../../shared';
import MemberContextMenu from '../../../../../../components/MemberContextMenu';
import { Permissions as ServerPermissions, hasPermission } from '../../../../../../index';
import type { ServerMember } from '../../../../../../services/serverMembersService';
import type { User } from '../../../../../../../../types/user';

interface ServerMembersProps {
    members: ServerMember[];
    serverId: number;
    currentUserPermissions?: string | bigint; // BigInt в виде строки или BigInt
    onRoleChange?: (memberId: number, newRole: string) => void;
    onRemoveMember?: (memberId: number) => void;
    onMemberUpdate?: () => void;
}

// Helper component for rendering a single member
const MemberItem: React.FC<{
    member: ServerMember;
    getMemberDisplayName: (member: ServerMember) => string;
    getMemberRoleColor: (member: ServerMember) => string | undefined;
    openProfile: (user: User, isOwnProfile?: boolean) => void;
    onContextMenu: (e: React.MouseEvent, member: ServerMember) => void;
    t: (key: string) => string;
}> = ({ member, getMemberDisplayName, getMemberRoleColor, openProfile, onContextMenu, t }) => {
    const userData =
        member.user != null
            ? {
                  id: member.user.id,
                  username: member.user.username,
                  email: `${member.user.username}@temp.com`,
                  profilePicture: member.user.profilePicture,
                  role: member.role,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  status: 'online' as const
              }
            : null;

    return (
        <div key={member.id} className="member-item" onContextMenu={(e) => onContextMenu(e, member)}>
            <div className="member-info">
                {userData != null ? (
                    <ClickableAvatar
                        user={userData}
                        size="small"
                        onClick={() => {
                            if (userData != null) {
                                openProfile(userData as User, false);
                            }
                        }}
                        className="member-avatar"
                    />
                ) : null}
                <span className="member-name" style={{ color: getMemberRoleColor(member) }}>
                    {getMemberDisplayName(member)}
                    {member.role === 'owner' && (
                        <span className="owner-badge" title={t('serverMembers.owner') ?? 'Владелец'}>
                            👑
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

// Helper component for rendering role section
const RoleSection: React.FC<{
    roleKey: string;
    roleMembers: ServerMember[];
    isExpanded: boolean;
    roleColor: string | undefined;
    getMemberDisplayName: (member: ServerMember) => string;
    getMemberRoleColor: (member: ServerMember) => string | undefined;
    openProfile: (user: User, isOwnProfile?: boolean) => void;
    onContextMenu: (e: React.MouseEvent, member: ServerMember) => void;
    onToggleExpansion: (role: string) => void;
    canManageMembers: boolean;
    canChangeRoles: boolean;
    currentUser: { id: number } | null;
    currentUserPermissions: string | bigint;
    onRoleChange?: (memberId: number, newRole: string) => void;
    onRemoveMember?: (memberId: number) => void;
    t: (key: string) => string;
}> = ({
    roleKey,
    roleMembers,
    isExpanded,
    roleColor,
    getMemberDisplayName,
    getMemberRoleColor,
    openProfile,
    onContextMenu,
    onToggleExpansion,
    canManageMembers,
    canChangeRoles,
    currentUser,
    currentUserPermissions,
    onRoleChange,
    onRemoveMember,
    t
}) => (
    <div key={roleKey} className="role-section">
        <div className="role-header" onClick={() => onToggleExpansion(roleKey)}>
            <span className="role-color-indicator" style={{ backgroundColor: roleColor ?? '#5865f2' }} />
            <span className="role-name">{roleKey}</span>
            <span className="role-count">({roleMembers.length})</span>
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>

        {isExpanded ? (
            <div className="members-list">
                {roleMembers.map((member) => (
                    <div key={member.id} className="member-item" onContextMenu={(e) => onContextMenu(e, member)}>
                        <div className="member-info">
                            {member.user != null ? (
                                <ClickableAvatar
                                    user={{
                                        id: member.user.id,
                                        username: member.user.username,
                                        email: `${member.user.username}@temp.com`,
                                        profilePicture: member.user.profilePicture,
                                        role: member.role,
                                        isActive: true,
                                        createdAt: new Date().toISOString(),
                                        status: 'online'
                                    }}
                                    size="small"
                                    onClick={() => {
                                        if (member.user != null) {
                                            openProfile(
                                                {
                                                    id: member.user.id,
                                                    username: member.user.username,
                                                    email: `${member.user.username}@temp.com`,
                                                    profilePicture: member.user.profilePicture,
                                                    role: member.role,
                                                    isActive: true,
                                                    createdAt: new Date().toISOString(),
                                                    status: 'online'
                                                } satisfies User,
                                                false
                                            );
                                        }
                                    }}
                                    className="member-avatar"
                                />
                            ) : null}
                            <span className="member-name" style={{ color: getMemberRoleColor(member) }}>
                                {getMemberDisplayName(member)}
                            </span>
                        </div>

                        {canManageMembers && member.userId !== currentUser?.id ? (
                            <div className="member-actions">
                                {canChangeRoles ? (
                                    <select
                                        value={member.role}
                                        onChange={(e) => onRoleChange?.(member.id, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="member">{t('serverMembers.roles.member')}</option>
                                        <option value="moderator">{t('serverMembers.roles.moderator')}</option>
                                        <option value="admin">{t('serverMembers.roles.admin')}</option>
                                    </select>
                                ) : null}

                                {hasPermission(currentUserPermissions, ServerPermissions.ADMINISTRATOR) &&
                                    member.role !== 'owner' && (
                                        <button
                                            onClick={() => onRemoveMember?.(member.id)}
                                            className="remove-member-btn"
                                            title={t('serverMembers.removeMember')}
                                        >
                                            🗑️
                                        </button>
                                    )}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        ) : null}
    </div>
);

/* eslint-disable max-lines-per-function -- Complex members list with role management */
const ServerMembers: React.FC<ServerMembersProps> = observer(
    ({ members, serverId, currentUserPermissions = 0n, onRoleChange, onRemoveMember, onMemberUpdate }) => {
        const { t } = useTranslation();
        const { openProfile } = useUserProfile();
        const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
        const [contextMenu, setContextMenu] = useState<{
            member: ServerMember;
            position: { x: number; y: number };
        } | null>(null);

        const currentUser = authStore.user;

        // Используем права вместо ролей для проверки доступа
        const canManageMembers =
            hasPermission(currentUserPermissions, ServerPermissions.MANAGE_GUILD) ||
            hasPermission(currentUserPermissions, ServerPermissions.ADMINISTRATOR);
        const canChangeRoles =
            hasPermission(currentUserPermissions, ServerPermissions.MANAGE_ROLES) ||
            hasPermission(currentUserPermissions, ServerPermissions.ADMINISTRATOR);

        const toggleRoleExpansion = (role: string) => {
            setExpandedRoles((prev) => ({
                ...prev,
                [role]: !prev[role]
            }));
        };

        // Группируем участников по ролям (используя highestRole если есть)
        const getMemberDisplayRole = (member: ServerMember): string => {
            if (member.role === 'owner') {
                return 'owner';
            }
            if (member.highestRole) {
                // Если есть highestRole, используем её для группировки
                return member.highestRole.name;
            }
            return member.role;
        };

        // Получаем цвет роли для отображения
        const getMemberRoleColor = (member: ServerMember): string | undefined => {
            if (member.highestRole?.color != null && member.highestRole.color !== '') {
                return member.highestRole.color;
            }
            // Цвета по умолчанию для базовых ролей
            switch (member.role) {
                case 'owner':
                    return '#faa61a';
                case 'admin':
                    return '#ed4245';
                case 'moderator':
                    return '#5865f2';
                case 'member':
                    return '#99aab5';
                default:
                    return '#99aab5';
            }
        };

        // Получаем отображаемое имя (никнейм или username)
        const getMemberDisplayName = (member: ServerMember): string =>
            member.nickname ?? member.user?.username ?? 'Unknown User';

        const handleContextMenu = useCallback(
            (e: React.MouseEvent, member: ServerMember) => {
                e.preventDefault();
                e.stopPropagation();

                // Не показываем меню для себя
                if (member.userId === currentUser?.id) {
                    return;
                }

                setContextMenu({
                    member,
                    position: { x: e.clientX, y: e.clientY }
                });
            },
            [currentUser?.id]
        );

        // Группируем участников: сначала владельцы, потом по ролям
        const ownerMembers = members.filter((m) => m.role === 'owner');
        const otherMembers = members.filter((m) => m.role !== 'owner');

        // Группируем остальных по highestRole или role
        const membersByRole = otherMembers.reduce<Record<string, ServerMember[]>>(
            (acc, member) => {
                const roleKey = getMemberDisplayRole(member);
                acc[roleKey] ??= [];
                acc[roleKey].push(member);
                return acc;
            },
            Object.create(null) as Record<string, ServerMember[]>
        );

        return (
            <div className="server-members">
                <h3 className="members-title">
                    {t('serverMembers.title')} — {members.length}
                </h3>

                {/* Владельцы */}
                {ownerMembers.length > 0 && (
                    <div className="role-section">
                        <div className="role-header" onClick={() => toggleRoleExpansion('owner')}>
                            <span className="role-icon">👑</span>
                            <span className="role-name">{t('serverMembers.roles.owner')}</span>
                            <span className="role-count">({ownerMembers.length})</span>
                            <span className="expand-icon">{expandedRoles.owner !== false ? '▼' : '▶'}</span>
                        </div>

                        {expandedRoles.owner !== false && (
                            <div className="members-list">
                                {ownerMembers.map((member) => (
                                    <MemberItem
                                        key={member.id}
                                        member={member}
                                        getMemberDisplayName={getMemberDisplayName}
                                        getMemberRoleColor={getMemberRoleColor}
                                        openProfile={openProfile}
                                        onContextMenu={handleContextMenu}
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Остальные участники, сгруппированные по ролям */}
                {Object.entries(membersByRole).map(([roleKey, roleMembers]) => {
                    if (roleMembers.length === 0) {
                        return null;
                    }

                    const isExpanded = (expandedRoles[roleKey] ?? true) !== false;
                    const firstMember = roleMembers[0];
                    const roleColor = getMemberRoleColor(firstMember);

                    return (
                        <RoleSection
                            key={roleKey}
                            roleKey={roleKey}
                            roleMembers={roleMembers}
                            isExpanded={isExpanded}
                            roleColor={roleColor}
                            getMemberDisplayName={getMemberDisplayName}
                            getMemberRoleColor={getMemberRoleColor}
                            openProfile={openProfile}
                            onContextMenu={handleContextMenu}
                            onToggleExpansion={toggleRoleExpansion}
                            canManageMembers={canManageMembers}
                            canChangeRoles={canChangeRoles}
                            currentUser={currentUser}
                            currentUserPermissions={currentUserPermissions}
                            onRoleChange={onRoleChange}
                            onRemoveMember={onRemoveMember}
                            t={t}
                        />
                    );
                })}

                {contextMenu ? (
                    <MemberContextMenu
                        member={contextMenu.member}
                        serverId={serverId}
                        currentUserPermissions={currentUserPermissions}
                        onClose={() => setContextMenu(null)}
                        onMemberUpdate={onMemberUpdate}
                        position={contextMenu.position}
                    />
                ) : null}
            </div>
        );
    }
);

export default ServerMembers;
