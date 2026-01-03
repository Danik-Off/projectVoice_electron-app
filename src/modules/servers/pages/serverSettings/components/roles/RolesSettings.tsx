import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { roleService } from '../../../../services/roleService';
import { authStore } from '../../../../../../core';
import { notificationStore } from '../../../../../../core';
import { serverMembersService } from '../../../../../../modules/servers';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../../types/role';
import { Permissions } from '../../../../constants/permissions';
import { hasPermission, canEditRole, canDeleteRole } from '../../../../utils/permissions';
import RoleEditor from './RoleEditor';
import './RolesSettings.scss';

const RolesSettings: React.FC = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentUserPermissions, setCurrentUserPermissions] = useState<bigint>(0n);
    const [currentUserHighestPosition, setCurrentUserHighestPosition] = useState(0);
    const [isOwner, setIsOwner] = useState(false);

    const currentUser = authStore.user;

    const loadRoles = useCallback(async () => {
        if (!serverId) return;
        
        setLoading(true);
        try {
            const rolesData = await roleService.getRoles(parseInt(serverId));
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error);
            notificationStore.addNotification(
                t('serverSettings.rolesLoadError') || 'Ошибка загрузки ролей',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [serverId, t]);

    const loadUserPermissions = useCallback(async () => {
        if (!serverId || !currentUser?.id) return;

        try {
            // Загружаем участников сервера
            const members = await serverMembersService.getServerMembers(parseInt(serverId));
            const userMember = members.find(m => m.userId === currentUser.id);
            
            if (!userMember) {
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
                setCurrentUserPermissions(Permissions.ADMINISTRATOR);
                setCurrentUserHighestPosition(999); // Максимальная позиция для владельца
                return;
            }
            
            // Загружаем все роли сервера с бэкенда для вычисления разрешений
            // Используем актуальные роли из состояния, если они уже загружены
            const currentRoles = roles.length > 0 
                ? roles 
                : await roleService.getRoles(parseInt(serverId));
            
            // Если роли еще не загружены в состояние, загружаем их
            if (roles.length === 0 && currentRoles.length > 0) {
                setRoles(currentRoles);
            }
            
            // Вычисляем разрешения на основе ролей пользователя
            if (userMember.roles && Array.isArray(userMember.roles) && userMember.roles.length > 0) {
                // Находим роли пользователя среди всех ролей сервера
                const userRoleIds = userMember.roles.map((r: Role | number) => 
                    typeof r === 'object' ? r.id : r
                );
                
                const userRoles = currentRoles.filter(r => userRoleIds.includes(r.id));
                
                // Вычисляем общие разрешения
                let totalPerms = 0n;
                let highestPosition = 0;
                
                userRoles.forEach(role => {
                    const rolePerms = BigInt(role.permissions);
                    totalPerms |= rolePerms;
                    if (role.position > highestPosition) {
                        highestPosition = role.position;
                    }
                });
                
                setCurrentUserPermissions(totalPerms);
                setCurrentUserHighestPosition(highestPosition);
            } else {
                // Если нет ролей, используем базовые разрешения
                setCurrentUserPermissions(0n);
                setCurrentUserHighestPosition(0);
            }
        } catch (error) {
            console.error('Error loading user permissions:', error);
            setCurrentUserPermissions(0n);
            setCurrentUserHighestPosition(0);
            setIsOwner(false);
        }
    }, [serverId, currentUser?.id, roles]);

    // Загружаем роли при монтировании компонента
    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    // Загружаем права пользователя после загрузки ролей
    useEffect(() => {
        if (serverId && currentUser?.id) {
            loadUserPermissions();
        }
    }, [serverId, currentUser?.id, roles.length, loadUserPermissions]);

    const handleCreateRole = () => {
        setEditingRole(undefined);
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
        if (!serverId) return;
        
        if (!canDeleteRole(currentUserHighestPosition, role.position, isOwner)) {
            notificationStore.addNotification(
                t('serverSettings.cannotDeleteRole') || 'У вас нет прав для удаления этой роли',
                'error'
            );
            return;
        }

        if (!confirm(t('serverSettings.confirmDeleteRole') || `Вы уверены, что хотите удалить роль "${role.name}"?`)) {
            return;
        }

        try {
            await roleService.deleteRole(parseInt(serverId), role.id);
            await loadRoles();
            notificationStore.addNotification(
                t('serverSettings.roleDeleted') || 'Роль удалена',
                'success'
            );
        } catch (error) {
            console.error('Error deleting role:', error);
            notificationStore.addNotification(
                t('serverSettings.roleDeleteError') || 'Ошибка удаления роли',
                'error'
            );
        }
    };

    const handleSaveRole = async (roleData: CreateRoleRequest | UpdateRoleRequest) => {
        if (!serverId) return;

        try {
            if (editingRole) {
                await roleService.updateRole(parseInt(serverId), editingRole.id, roleData);
                notificationStore.addNotification(
                    t('serverSettings.roleUpdated') || 'Роль обновлена',
                    'success'
                );
            } else {
                // При создании новой роли устанавливаем позицию выше всех существующих
                const maxPosition = roles.length > 0 
                    ? Math.max(...roles.map(r => r.position)) + 1 
                    : 1;
                
                // Убеждаемся, что все обязательные поля присутствуют
                if (!roleData.name) {
                    throw new Error('Имя роли обязательно');
                }
                
                const createData: CreateRoleRequest = {
                    name: roleData.name,
                    color: roleData.color,
                    permissions: roleData.permissions,
                    position: roleData.position || maxPosition,
                    isHoisted: roleData.isHoisted,
                    isMentionable: roleData.isMentionable,
                };
                
                await roleService.createRole(parseInt(serverId), createData);
                notificationStore.addNotification(
                    t('serverSettings.roleCreated') || 'Роль создана',
                    'success'
                );
            }
            await loadRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            notificationStore.addNotification(
                t('serverSettings.roleSaveError') || `Ошибка сохранения роли: ${errorMessage}`,
                'error'
            );
            throw error;
        }
    };

    // Владелец всегда может управлять ролями
    // Также проверяем разрешение MANAGE_ROLES или MANAGE_GUILD
    const canManageRoles = isOwner || 
        hasPermission(currentUserPermissions, Permissions.MANAGE_ROLES) ||
        hasPermission(currentUserPermissions, Permissions.MANAGE_GUILD) ||
        hasPermission(currentUserPermissions, Permissions.ADMINISTRATOR);

    // Для владельца всегда показываем кнопку создания, даже если разрешения еще не загружены
    const showCreateButton = canManageRoles || isOwner;

    if (loading) {
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
                {showCreateButton && (
                    <button 
                        className="create-role-button"
                        onClick={handleCreateRole}
                    >
                        + {t('serverSettings.createRole') || 'Создать роль'}
                    </button>
                )}
            </div>
            
            <div className="section-content">
                <div className="roles-list">
                    {roles.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎭</div>
                            <h3>{t('serverSettings.noRoles') || 'Роли не найдены'}</h3>
                            <p>{t('serverSettings.noRolesDescription') || 'Создайте роли для управления разрешениями участников сервера'}</p>
                            {showCreateButton && (
                                <button 
                                    className="create-first-role-button"
                                    onClick={handleCreateRole}
                                >
                                    {t('serverSettings.createFirstRole') || 'Создать первую роль'}
                                </button>
                            )}
                        </div>
                    ) : (
                        // Сортируем роли по позиции (больше = выше в иерархии)
                        [...roles].sort((a, b) => b.position - a.position).map((role) => {
                            const canEdit = canEditRole(currentUserHighestPosition, role.position, isOwner);
                            const canDelete = canDeleteRole(currentUserHighestPosition, role.position, isOwner);
                            
                            return (
                                <div key={role.id} className="role-item">
                                    <div 
                                        className="role-color-indicator"
                                        style={{ backgroundColor: role.color || '#5865F2' }}
                                    />
                                    <div className="role-content">
                                        <div className="role-header">
                                            <h3 className="role-name">{role.name}</h3>
                                            <div className="role-badges">
                                                {role.isHoisted && (
                                                    <span className="badge">{t('serverSettings.hoisted') || 'Отдельно'}</span>
                                                )}
                                                {role.isMentionable && (
                                                    <span className="badge">{t('serverSettings.mentionable') || 'Упоминаемая'}</span>
                                                )}
                                                <span className="badge position">
                                                    {t('serverSettings.position') || 'Позиция'}: {role.position}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="role-actions">
                                            {canEdit && (
                                                <button
                                                    className="action-button edit"
                                                    onClick={() => handleEditRole(role)}
                                                >
                                                    {t('common.edit') || 'Редактировать'}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    className="action-button delete"
                                                    onClick={() => handleDeleteRole(role)}
                                                >
                                                    {t('common.delete') || 'Удалить'}
                                                </button>
                                            )}
                                            {!canEdit && !canDelete && (
                                                <span className="no-permissions">
                                                    {t('serverSettings.noPermissions') || 'Нет прав для управления'}
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
                    setEditingRole(undefined);
                }}
                onSave={handleSaveRole}
            />
        </div>
    );
});

export default RolesSettings;
