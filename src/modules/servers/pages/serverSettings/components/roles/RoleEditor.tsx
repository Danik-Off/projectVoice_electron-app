import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../../types/role';
import { Permissions as PermissionsEnum, PermissionNames, PermissionGroups } from '../../../../constants/permissions';
import { combinePermissions, permissionsToString, stringToPermissions } from '../../../../utils/permissions';
import './RoleEditor.scss';

interface RoleEditorProps {
    role?: Role;
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleData: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
}

/* eslint-disable max-lines-per-function -- Complex role editor component */
const RoleEditor: React.FC<RoleEditorProps> = observer(({ role, isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [roleName, setRoleName] = useState('');
    const [color, setColor] = useState('#5865F2');
    const [selectedPermissions, setSelectedPermissions] = useState<Set<bigint>>(new Set());
    const [isHoisted, setIsHoisted] = useState(false);
    const [isMentionable, setIsMentionable] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['GENERAL']));

    useEffect(() => {
        if (role != null) {
            setRoleName(role.name);
            setColor(role.color ?? '#5865F2');
            setIsHoisted(role.isHoisted ?? false);
            setIsMentionable(role.isMentionable ?? false);

            // Загружаем разрешения
            const perms = stringToPermissions(role.permissions);
            const permSet = new Set<bigint>();
            Object.values(PermissionsEnum).forEach((perm) => {
                // eslint-disable-next-line no-bitwise -- Битовые операции необходимы для работы с разрешениями
                if ((perms & perm) === perm) {
                    permSet.add(perm);
                }
            });
            setSelectedPermissions(permSet);
        } else {
            // Сброс для новой роли
            setRoleName('');
            setColor('#5865F2');
            setSelectedPermissions(new Set());
            setIsHoisted(false);
            setIsMentionable(false);
        }
    }, [role, isOpen]);

    const togglePermission = (permission: bigint) => {
        const newSet = new Set(selectedPermissions);
        if (newSet.has(permission)) {
            newSet.delete(permission);
        } else {
            newSet.add(permission);
        }
        setSelectedPermissions(newSet);
    };

    const toggleGroup = (groupName: string) => {
        const newSet = new Set(expandedGroups);
        if (newSet.has(groupName)) {
            newSet.delete(groupName);
        } else {
            newSet.add(groupName);
        }
        setExpandedGroups(newSet);
    };

    const toggleAllInGroup = (group: readonly string[]) => {
        const groupPerms = group.map((key) => PermissionsEnum[key as keyof typeof PermissionsEnum]);
        const allSelected = groupPerms.every((perm) => selectedPermissions.has(perm));

        const newSet = new Set(selectedPermissions);
        if (allSelected) {
            groupPerms.forEach((perm) => {
                newSet.delete(perm);
            });
        } else {
            groupPerms.forEach((perm) => {
                newSet.add(perm);
            });
        }
        setSelectedPermissions(newSet);
    };

    const handleSave = async () => {
        if (roleName.trim().length === 0) {
            // eslint-disable-next-line no-alert -- Alert is used for validation
            alert(t('serverSettings.roleNameRequired') ?? 'Имя роли обязательно');
            return;
        }

        setSaving(true);
        try {
            const combinedPerms = combinePermissions(Array.from(selectedPermissions));
            const roleData: CreateRoleRequest | UpdateRoleRequest = {
                name: roleName.trim(),
                color,
                permissions: permissionsToString(combinedPerms),
                isHoisted,
                isMentionable
            };

            await onSave(roleData);
            onClose();
        } catch (saveError: unknown) {
            console.error('Error saving role:', saveError);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="role-editor-overlay" onClick={onClose}>
            <div className="role-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="role-editor-header">
                    <h2>{role ? t('serverSettings.editRole') : t('serverSettings.createRole')}</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="role-editor-content">
                    {/* Основная информация */}
                    <div className="role-editor-section">
                        <label className="role-editor-label">
                            {t('serverSettings.roleName') || 'Имя роли'}
                            <input
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder={t('serverSettings.roleNamePlaceholder') || 'Новая роль'}
                                maxLength={100}
                            />
                        </label>

                        <label className="role-editor-label">
                            {t('serverSettings.roleColor') || 'Цвет роли'}
                            <div className="color-picker-container">
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="color-input"
                                />
                            </div>
                        </label>

                        <div className="role-editor-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isHoisted}
                                    onChange={(e) => setIsHoisted(e.target.checked)}
                                />
                                {t('serverSettings.hoistRole') || 'Отображать участников этой роли отдельно'}
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isMentionable}
                                    onChange={(e) => setIsMentionable(e.target.checked)}
                                />
                                {t('serverSettings.mentionableRole') || 'Разрешить упоминание этой роли'}
                            </label>
                        </div>
                    </div>

                    {/* Разрешения */}
                    <div className="role-editor-section">
                        <h3>{t('serverSettings.permissions') || 'Разрешения'}</h3>

                        {Object.entries(PermissionGroups).map(([groupName, groupKeys]) => (
                            <div key={groupName} className="permission-group">
                                <div className="permission-group-header" onClick={() => toggleGroup(groupName)}>
                                    <span>{groupName}</span>
                                    <span className="toggle-icon">{expandedGroups.has(groupName) ? '▼' : '▶'}</span>
                                </div>

                                {expandedGroups.has(groupName) && (
                                    <div className="permission-group-content">
                                        <button
                                            className="toggle-all-button"
                                            onClick={() => toggleAllInGroup(groupKeys)}
                                        >
                                            {groupKeys.every((key) =>
                                                selectedPermissions.has(
                                                    PermissionsEnum[key as keyof typeof PermissionsEnum]
                                                )
                                            )
                                                ? 'Снять все'
                                                : 'Выбрать все'}
                                        </button>

                                        <div className="permissions-list">
                                            {groupKeys.map((key) => {
                                                const perm = PermissionsEnum[key as keyof typeof PermissionsEnum];
                                                const isSelected = selectedPermissions.has(perm);
                                                return (
                                                    <label key={key} className="permission-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => togglePermission(perm)}
                                                        />
                                                        <span>
                                                            {PermissionNames[key as keyof typeof PermissionNames]}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="role-editor-footer">
                    <button className="cancel-button" onClick={onClose}>
                        {t('common.cancel') || 'Отмена'}
                    </button>
                    <button
                        className="save-button"
                        onClick={() => {
                            handleSave().catch((saveError: unknown) => {
                                console.error('Error in handleSave:', saveError);
                            });
                        }}
                        disabled={saving === true || roleName.trim().length === 0}
                    >
                        {saving ? t('common.saving') || 'Сохранение...' : t('common.save') || 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default RoleEditor;
