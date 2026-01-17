import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService } from '../../../../../../../../modules/servers';
import { notificationStore } from '../../../../../../../../core';
import type { MemberRolesModalProps } from '../../types';
import type { Role } from '../../../../../../types/role';
import './MemberRolesModal.scss';

/* eslint-disable max-lines-per-function -- Complex modal component */
/* eslint-disable complexity -- Complex modal logic */
const MemberRolesModal: React.FC<MemberRolesModalProps> = ({ isOpen, member, serverId, roles, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (member?.roles != null && member.roles.length > 0) {
            const roleIds = member.roles
                .map((r) => {
                    if (typeof r === 'object' && r != null && 'id' in r) {
                        return (r as { id: number }).id;
                    }
                    if (typeof r === 'number') {
                        return r;
                    }
                    return 0;
                })
                .filter((id) => id > 0);
            setSelectedRoleIds(roleIds);
        } else {
            setSelectedRoleIds([]);
        }
    }, [member, isOpen]);

    const handleToggleRole = (roleId: number) => {
        if (selectedRoleIds.includes(roleId)) {
            setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
        } else {
            setSelectedRoleIds((prev) => [...prev, roleId]);
        }
    };

    const handleSave = async () => {
        if (!member) {
            return;
        }

        setSaving(true);
        try {
            await serverMembersService.updateMemberRoles(serverId, member.id, selectedRoleIds);
            notificationStore.addNotification(t('serverSettings.rolesUpdated') || 'Роли обновлены', 'success');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating roles:', error);
            notificationStore.addNotification(
                t('serverSettings.rolesUpdateError') || 'Ошибка обновления ролей',
                'error'
            );
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !member) {
        return null;
    }

    const sortedRoles = roles.slice().sort((a: Role, b: Role) => {
        const aPosition: number = a.position;
        const bPosition: number = b.position;
        return bPosition - aPosition;
    });

    return (
        <div className="member-roles-modal-overlay" onClick={onClose}>
            <div className="member-roles-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        {t('serverSettings.manageRolesFor') ?? 'Управление ролями для'}:{' '}
                        {member.nickname ?? member.user?.username ?? 'Unknown'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    <div className="member-preview">
                        <img
                            src={member.user?.profilePicture ?? '/default-avatar.png'}
                            alt={member.user?.username ?? ''}
                            className="preview-avatar"
                        />
                        <div className="preview-info">
                            <span
                                className="preview-name"
                                style={{
                                    color:
                                        member.highestRole?.color != null && member.highestRole.color.length > 0
                                            ? member.highestRole.color
                                            : null
                                }}
                            >
                                {member.nickname ?? member.user?.username ?? 'Unknown'}
                            </span>
                            {member.nickname != null && member.nickname.length > 0 ? (
                                <span className="preview-username">@{member.user?.username ?? ''}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="roles-selection">
                        <h4>{t('serverSettings.selectRoles') || 'Выберите роли'}</h4>
                        {sortedRoles.length === 0 ? (
                            <p className="no-roles">{t('serverSettings.noRolesAvailable') || 'Нет доступных ролей'}</p>
                        ) : (
                            <div className="roles-list">
                                {sortedRoles.map((roleItem: Role) => {
                                    const roleId: number = roleItem.id;
                                    const isSelected = selectedRoleIds.includes(roleId);
                                    const roleColor: string | undefined = roleItem.color;
                                    const roleName: string = roleItem.name;
                                    const rolePosition: number = roleItem.position;
                                    return (
                                        <label
                                            key={roleId}
                                            className={`role-item ${isSelected === true ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleRole(roleId)}
                                                disabled={saving}
                                            />
                                            <span
                                                className="role-color-indicator"
                                                style={{ backgroundColor: roleColor ?? '#5865F2' }}
                                            />
                                            <span className="role-name">{roleName}</span>
                                            <span className="role-position">Позиция: {rolePosition}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={saving}>
                        {t('common.cancel') || 'Отмена'}
                    </button>
                    <button
                        className="btn-save"
                        onClick={() => {
                            handleSave().catch((error: unknown) => {
                                console.error('Error in handleSave:', error);
                            });
                        }}
                        disabled={saving}
                    >
                        {saving ? t('common.saving') || 'Сохранение...' : t('common.save') || 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberRolesModal;
