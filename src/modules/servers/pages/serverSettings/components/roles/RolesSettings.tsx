/* eslint-disable max-lines-per-function -- Complex roles settings component */
/* eslint-disable complexity -- Complex roles settings logic */
/* eslint-disable no-bitwise -- Bitwise operations are required for permissions */
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { roleService } from '../../../../services/roleService';
import { authStore, notificationStore } from '../../../../../../core';
import { serverMembersService } from '../../../../../../modules/servers';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../../types/role';
import { Permissions as PermissionsEnum } from '../../../../constants/permissions';
import { hasPermission, canEditRole, canDeleteRole } from '../../../../utils/permissions';
import RoleEditor from './RoleEditor';
import './RolesSettings.scss';

interface RolesSettingsProps {
    currentUserPermissions?: string | bigint;
}

const RolesSettings: React.FC<RolesSettingsProps> = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentUserPermissions, setCurrentUserPermissions] = useState<bigint>(0n);
    const [currentUserHighestPosition, setCurrentUserHighestPosition] = useState(0);
    const [isOwner, setIsOwner] = useState(false);

    const currentUser = authStore.user;

    const loadRoles = useCallback(async () => {
        if (serverId == null || serverId.length === 0) {
            return;
        }

        setLoading(true);
        try {
            const rolesData = await roleService.getRoles(parseInt(serverId, 10));
            setRoles(rolesData);
        } catch (loadError: unknown) {
            console.error('Error loading roles:', loadError);
            notificationStore.addNotification(t('serverSettings.rolesLoadError') ?? 'Ошибка загрузки ролей', 'error');
        } finally {
            setLoading(false);
        }
    }, [serverId, t]);

    const loadUserPermissions = useCallback(async () => {
        if (serverId == null || serverId.length === 0 || currentUser?.id == null) {
            return;
        }

        try {
            // Загружаем участников сервера
            const members = await serverMembersService.getServerMembers(parseInt(serverId, 10));
            const userMember = members.find((m) => m.userId === currentUser.id);

            if (userMember == null) {
                setCurrentUserPermissions(0n);
                setCurrentUserHighestPosition(0);
                setIsOwner(false);
                return;
            }

            // Проверяем, является ли пользователь владельцем
            const isUserOwner = userMember.role === 'owner';
            setIsOwner(isUserOwner);

            // Если владелец, даем максимальные права
            if (isUserOwner) {
                setCurrentUserPermissions(PermissionsEnum.ADMINISTRATOR);
                setCurrentUserHighestPosition(999); // Максимальная позиция для владельца
                return;
            }

            // Загружаем все роли сервера с бэкенда для вычисления разрешений
            // Используем актуальные роли из состояния, если они уже загружены
            const currentRoles = roles.length > 0 ? roles : await roleService.getRoles(parseInt(serverId, 10));

            // Если роли еще не загружены в состояние, загружаем их
            if (roles.length === 0 && currentRoles.length > 0) {
                setRoles(currentRoles);
            }

            // Вычисляем разрешения на основе ролей пользователя
            if (userMember.roles != null && Array.isArray(userMember.roles) && userMember.roles.length > 0) {
                // Находим роли пользователя среди всех ролей сервера
                const userRoleIds = userMember.roles.map((r: Role | number) => (typeof r === 'object' ? r.id : r));

                const userRoles = currentRoles.filter((r) => userRoleIds.includes(r.id));

                // Вычисляем общие разрешения
                let totalPerms = 0n;
                let highestPosition = 0;

                userRoles.forEach((userRole) => {
                    const rolePerms = BigInt(userRole.permissions);
                    totalPerms |= rolePerms;
                    if (userRole.position > highestPosition) {
                        highestPosition = userRole.position;
                    }
                });

                setCurrentUserPermissions(totalPerms);
                setCurrentUserHighestPosition(highestPosition);
            } else {
                // Если нет ролей, используем базовые разрешения
                setCurrentUserPermissions(0n);
                setCurrentUserHighestPosition(0);
            }
        } catch (permissionsError: unknown) {
            console.error('Error loading user permissions:', permissionsError);
            setCurrentUserPermissions(0n);
            setCurrentUserHighestPosition(0);
            setIsOwner(false);
        }
    }, [serverId, currentUser?.id, roles]);

    // Загружаем роли при монтировании компонента
    useEffect(() => {
        loadRoles().catch((loadError: unknown) => {
            console.error('Error in loadRoles:', loadError);
        });
    }, [loadRoles]);

    // Загружаем права пользователя после загрузки ролей
    useEffect(() => {
        if (serverId != null && serverId.length > 0 && currentUser?.id != null) {
            loadUserPermissions().catch((permissionsError: unknown) => {
                console.error('Error in loadUserPermissions:', permissionsError);
            });
        }
    }, [serverId, currentUser?.id, roles.length, loadUserPermissions]);

    const handleCreateRole = () => {
        setEditingRole(null);
        setIsEditorOpen(true);
    };

    const handleEditRole = (role: Role) => {
        if (!canEditRole(currentUserHighestPosition, role.position, isOwner)) {
            notificationStore.addNotification(
                t('serverSettings.cannotEditRole') || 'У вас нет прав для редактирования этой роли',
                'error'
            );
            return;
        }
        setEditingRole(role);
        setIsEditorOpen(true);
    };

    const handleDeleteRole = async (role: Role) => {
        if (serverId == null || serverId.length === 0) {
            return;
        }

        if (!canDeleteRole(currentUserHighestPosition, role.position, isOwner)) {
            notificationStore.addNotification(
                t('serverSettings.cannotDeleteRole') ?? 'У вас нет прав для удаления этой роли',
                'error'
            );
            return;
        }

        // eslint-disable-next-line no-alert
        if (!confirm(t('serverSettings.confirmDeleteRole') ?? `Вы уверены, что хотите удалить роль "${role.name}"?`)) {
            return;
        }

        try {
            await roleService.deleteRole(parseInt(serverId, 10), role.id);
            await loadRoles();
            notificationStore.addNotification(t('serverSettings.roleDeleted') ?? 'Роль удалена', 'success');
        } catch (deleteError: unknown) {
            console.error('Error deleting role:', deleteError);
            notificationStore.addNotification(t('serverSettings.roleDeleteError') ?? 'Ошибка удаления роли', 'error');
        }
    };

    const handleSaveRole = async (roleData: CreateRoleRequest | UpdateRoleRequest) => {
        if (serverId == null || serverId.length === 0) {
            return;
        }

        try {
            if (editingRole != null) {
                await roleService.updateRole(parseInt(serverId, 10), editingRole.id, roleData);
                notificationStore.addNotification(t('serverSettings.roleUpdated') ?? 'Роль обновлена', 'success');
            } else {
                // При создании новой роли устанавливаем позицию выше всех существующих
                const maxPosition = roles.length > 0 ? Math.max(...roles.map((r) => r.position)) + 1 : 1;

                // Убеждаемся, что все обязательные поля присутствуют
                if (roleData.name == null || roleData.name.length === 0) {
                    throw new Error('Имя роли обязательно');
                }

                const createData: CreateRoleRequest = {
                    name: roleData.name,
                    color: roleData.color,
                    permissions: roleData.permissions,
                    position: roleData.position ?? maxPosition,
                    isHoisted: roleData.isHoisted,
                    isMentionable: roleData.isMentionable
                };

                await roleService.createRole(parseInt(serverId, 10), createData);
                notificationStore.addNotification(t('serverSettings.roleCreated') ?? 'Роль создана', 'success');
            }
            await loadRoles();
        } catch (saveError: unknown) {
            console.error('Error saving role:', saveError);
            const errorMessage = saveError instanceof Error ? saveError.message : 'Неизвестная ошибка';
            notificationStore.addNotification(
                t('serverSettings.roleSaveError') ?? `Ошибка сохранения роли: ${errorMessage}`,
                'error'
            );
            throw saveError;
        }
    };

    // Владелец всегда может управлять ролями
    // Также проверяем разрешение MANAGE_ROLES или MANAGE_GUILD
    const canManageRoles =
        isOwner === true ||
        hasPermission(currentUserPermissions, PermissionsEnum.MANAGE_ROLES) ||
        hasPermission(currentUserPermissions, PermissionsEnum.MANAGE_GUILD) ||
        hasPermission(currentUserPermissions, PermissionsEnum.ADMINISTRATOR);

    // Для владельца всегда показываем кнопку создания, даже если разрешения еще не загружены
    const showCreateButton = canManageRoles === true || isOwner === true;

    if (loading === true) {
        return (
            <div className="settings-section">
                <div className="loading-state">
                    <p>{t('common.loading') || 'Загрузка...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-section">
            <div className="section-header">
                <div className="header-content">
                    <h2>{t('serverSettings.roles') || 'Роли'}</h2>
                    <p>{t('serverSettings.rolesDescription') || 'Управляйте ролями сервера и их разрешениями'}</p>
                </div>
                {showCreateButton ? (
                    <button className="create-role-button" onClick={handleCreateRole}>
                        + {t('serverSettings.createRole') || 'Создать роль'}
                    </button>
                ) : null}
            </div>

            <div className="section-content">
                <div className="roles-list">
                    {roles.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎭</div>
                            <h3>{t('serverSettings.noRoles') || 'Роли не найдены'}</h3>
                            <p>
                                {t('serverSettings.noRolesDescription') ||
                                    'Создайте роли для управления разрешениями участников сервера'}
                            </p>
                            {showCreateButton ? (
                                <button className="create-first-role-button" onClick={handleCreateRole}>
                                    {t('serverSettings.createFirstRole') || 'Создать первую роль'}
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        // Сортируем роли по позиции (больше = выше в иерархии)
                        [...roles]
                            .sort((a, b) => b.position - a.position)
                            .map((role) => {
                                const canEdit = canEditRole(currentUserHighestPosition, role.position, isOwner);
                                const canDelete = canDeleteRole(currentUserHighestPosition, role.position, isOwner);

                                return (
                                    <div key={role.id} className="role-item">
                                        <div
                                            className="role-color-indicator"
                                            style={{ backgroundColor: role.color ?? '#5865F2' }}
                                        />
                                        <div className="role-content">
                                            <div className="role-header">
                                                <h3 className="role-name">{role.name}</h3>
                                                <div className="role-badges">
                                                    {role.isHoisted === true ? (
                                                        <span className="badge">
                                                            {t('serverSettings.hoisted') ?? 'Отдельно'}
                                                        </span>
                                                    ) : null}
                                                    {role.isMentionable === true ? (
                                                        <span className="badge">
                                                            {t('serverSettings.mentionable') ?? 'Упоминаемая'}
                                                        </span>
                                                    ) : null}
                                                    <span className="badge position">
                                                        {t('serverSettings.position') || 'Позиция'}: {role.position}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="role-actions">
                                                {canEdit === true ? (
                                                    <button
                                                        className="action-button edit"
                                                        onClick={() => handleEditRole(role)}
                                                    >
                                                        {t('common.edit') ?? 'Редактировать'}
                                                    </button>
                                                ) : null}
                                                {canDelete === true ? (
                                                    <button
                                                        className="action-button delete"
                                                        onClick={() => {
                                                            handleDeleteRole(role).catch((deleteError: unknown) => {
                                                                console.error(
                                                                    'Error in handleDeleteRole:',
                                                                    deleteError
                                                                );
                                                            });
                                                        }}
                                                    >
                                                        {t('common.delete') ?? 'Удалить'}
                                                    </button>
                                                ) : null}
                                                {canEdit !== true && canDelete !== true && (
                                                    <span className="no-permissions">
                                                        {t('serverSettings.noPermissions') ?? 'Нет прав для управления'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>

            <RoleEditor
                role={editingRole}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingRole(null);
                }}
                onSave={(roleData) => {
                    handleSaveRole(roleData).catch((saveError: unknown) => {
                        console.error('Error in handleSaveRole:', saveError);
                    });
                }}
            />
        </div>
    );
});

export default RolesSettings;
