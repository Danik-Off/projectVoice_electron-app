import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService } from '../../../../../../../../modules/servers';
import { notificationStore } from '../../../../../../../../core';
import type { MemberRolesModalProps } from '../../types';
import './MemberRolesModal.scss';

const MemberRolesModal: React.FC<MemberRolesModalProps> = ({ isOpen, member, serverId, roles, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (member?.roles) {
            const roleIds = member.roles.map((r: any) => (typeof r === 'object' ? r.id : r));
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

    const sortedRoles = [...roles].sort((a, b) => b.position - a.position);

    return (
        <div className="member-roles-modal-overlay" onClick={onClose}>
            <div className="member-roles-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        {t('serverSettings.manageRolesFor') || 'Управление ролями для'}:{' '}
                        {member.nickname || member.user?.username}
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    <div className="member-preview">
                        <img
                            src={member.user?.profilePicture || '/default-avatar.png'}
                            alt={member.user?.username}
                            className="preview-avatar"
                        />
                        <div className="preview-info">
                            <span className="preview-name" style={{ color: member.highestRole?.color }}>
                                {member.nickname || member.user?.username}
                            </span>
                            {member.nickname ? (
                                <span className="preview-username">@{member.user?.username}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="roles-selection">
                        <h4>{t('serverSettings.selectRoles') || 'Выберите роли'}</h4>
                        {sortedRoles.length === 0 ? (
                            <p className="no-roles">{t('serverSettings.noRolesAvailable') || 'Нет доступных ролей'}</p>
                        ) : (
                            <div className="roles-list">
                                {sortedRoles.map((role) => {
                                    const isSelected = selectedRoleIds.includes(role.id);
                                    return (
                                        <label key={role.id} className={`role-item ${isSelected ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleRole(role.id)}
                                                disabled={saving}
                                            />
                                            <span
                                                className="role-color-indicator"
                                                style={{ backgroundColor: role.color || '#5865F2' }}
                                            />
                                            <span className="role-name">{role.name}</span>
                                            <span className="role-position">Позиция: {role.position}</span>
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
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? t('common.saving') || 'Сохранение...' : t('common.save') || 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberRolesModal;
