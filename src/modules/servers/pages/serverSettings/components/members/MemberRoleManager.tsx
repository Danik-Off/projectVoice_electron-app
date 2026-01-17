import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { roleService } from '../../../../services/roleService';
import type { Role } from '../../../../types/role';
import type { ServerMember } from '../../../../services/serverMembersService';
import './MemberRoleManager.scss';

interface MemberRoleManagerProps {
    member: ServerMember;
    serverId: number;
    roles: Role[];
    onRoleChange: () => void;
}

const MemberRoleManager: React.FC<MemberRoleManagerProps> = observer(({ member, serverId, roles, onRoleChange }) => {
    const { t } = useTranslation();
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Загружаем текущие роли участника
        if (member.roles && Array.isArray(member.roles)) {
            const roleIds = member.roles.map((r: Role | number) => (typeof r === 'object' ? r.id : r));
            setSelectedRoles(roleIds);
        } else {
            setSelectedRoles([]);
        }
    }, [member]);

    const toggleRole = async (roleId: number) => {
        if (saving) {
            return;
        }

        const isSelected = selectedRoles.includes(roleId);
        setSaving(true);

        try {
            if (isSelected) {
                // Удаляем роль
                await roleService.removeRoleFromMember(serverId, member.id, roleId);
                setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
            } else {
                // Добавляем роль
                await roleService.assignRoleToMember(serverId, member.id, roleId);
                setSelectedRoles((prev) => [...prev, roleId]);
            }
            onRoleChange();
        } catch (error) {
            console.error('Error toggling role:', error);
        } finally {
            setSaving(false);
        }
    };

    const memberRoleIds = member.roles
        ? member.roles.map((r: Role | number) => (typeof r === 'object' ? r.id : r))
        : [];

    // Сортируем роли по позиции (больше = выше в иерархии)
    const sortedRoles = [...roles].sort((a, b) => b.position - a.position);

    return (
        <div className="member-role-manager">
            <h4>{t('serverSettings.memberRoles') || 'Роли участника'}</h4>
            <div className="roles-list">
                {sortedRoles.length === 0 ? (
                    <p className="no-roles">{t('serverSettings.noRolesAvailable') || 'Нет доступных ролей'}</p>
                ) : (
                    sortedRoles.map((role) => {
                        const isSelected = memberRoleIds.includes(role.id);
                        return (
                            <label key={role.id} className="role-checkbox">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                        toggleRole(role.id).catch((error: unknown) => {
                                            console.error('Error in toggleRole:', error);
                                        });
                                    }}
                                    disabled={saving}
                                />
                                <span className="role-color" style={{ backgroundColor: role.color ?? '#5865F2' }} />
                                <span className="role-name">{role.name}</span>
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
});

export default MemberRoleManager;
