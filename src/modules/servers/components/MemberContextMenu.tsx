import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService, Permissions, hasPermission } from '../index';
import { notificationStore } from '../../../core';
import { roleService } from '../services/roleService';
import type { ServerMember } from '../services/serverMembersService';
import type { Role } from '../types/role';
import MemberRolesModal from '../pages/serverSettings/components/members/MemberRolesModal';
import './MemberContextMenu.scss';

interface MemberContextMenuProps {
    member: ServerMember;
    serverId: number;
    currentUserPermissions: string | bigint; // BigInt в виде строки или BigInt
    onClose: () => void;
    onMemberUpdate?: () => void;
    position: { x: number; y: number };
}

interface BanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const BanModal: React.FC<BanModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="ban-modal-overlay" onClick={onClose}>
            <div className="ban-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{t('serverMembers.banMember') || 'Забанить участника'}</h3>
                <p>{t('serverMembers.banReason') || 'Причина (необязательно):'}</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('serverMembers.banReasonPlaceholder') || 'Введите причину бана...'}
                    rows={4}
                />
                <div className="ban-modal-actions">
                    <button onClick={onClose} className="cancel-btn">
                        {t('common.cancel') || 'Отмена'}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm(reason);
                            setReason('');
                        }} 
                        className="confirm-btn"
                    >
                        {t('serverMembers.ban') || 'Забанить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MemberContextMenu: React.FC<MemberContextMenuProps> = ({
    member,
    serverId,
    currentUserPermissions,
    onClose,
    onMemberUpdate,
    position
}) => {
    const { t } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [isMuted, setIsMuted] = useState(member.isMuted || false);
    const [isDeafened, setIsDeafened] = useState(member.isDeafened || false);

    useEffect(() => {
        let cleanup: (() => void) | null = null;
        
        // Небольшая задержка перед добавлением обработчика, чтобы не закрыть меню сразу после открытия
        const timeoutId = setTimeout(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };

            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);

            cleanup = () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
            };
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (cleanup) {
                cleanup();
            }
        };
    }, [onClose]);

    // Загрузка ролей при открытии меню управления ролями
    useEffect(() => {
        if (showRolesModal && roles.length === 0 && !loadingRoles) {
            loadRoles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showRolesModal]);

    const loadRoles = async () => {
        setLoadingRoles(true);
        try {
            const rolesData = await roleService.getRoles(serverId);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error);
            notificationStore.addNotification(
                t('serverSettings.rolesLoadError') || 'Ошибка загрузки ролей',
                'error'
            );
        } finally {
            setLoadingRoles(false);
        }
    };

    // Проверка прав
    const canKick = hasPermission(currentUserPermissions, Permissions.KICK_MEMBERS);
    const canBan = hasPermission(currentUserPermissions, Permissions.BAN_MEMBERS);
    const canMute = hasPermission(currentUserPermissions, Permissions.MUTE_MEMBERS);
    const canDeafen = hasPermission(currentUserPermissions, Permissions.DEAFEN_MEMBERS);
    const canManageRoles = hasPermission(currentUserPermissions, Permissions.MANAGE_ROLES);

    const handleKick = async () => {
        try {
            await serverMembersService.kickMember(serverId, member.id);
            notificationStore.addNotification(
                t('serverMembers.memberKicked') || 'Участник исключен',
                'success'
            );
            onMemberUpdate?.();
            onClose();
        } catch (error) {
            console.error('Error kicking member:', error);
            notificationStore.addNotification(
                t('serverMembers.kickError') || 'Ошибка при исключении участника',
                'error'
            );
        }
    };

    const handleBan = async (reason: string) => {
        try {
            await serverMembersService.banMember(serverId, member.id, reason || undefined);
            notificationStore.addNotification(
                t('serverMembers.memberBanned') || 'Участник забанен',
                'success'
            );
            onMemberUpdate?.();
            setShowBanModal(false);
            onClose();
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
            onMemberUpdate?.();
        } catch (error) {
            console.error('Error toggling mute:', error);
            notificationStore.addNotification(
                t('serverMembers.muteError') || 'Ошибка при изменении статуса микрофона',
                'error'
            );
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
            onMemberUpdate?.();
        } catch (error) {
            console.error('Error toggling deafen:', error);
            notificationStore.addNotification(
                t('serverMembers.deafenError') || 'Ошибка при изменении статуса звука',
                'error'
            );
        }
    };

    // Если нет прав на модерацию, не показываем меню
    // Но если меню было открыто, показываем его (возможно, права изменились)
    const hasAnyPermission = canKick || canBan || canMute || canDeafen || canManageRoles;
    
    if (!hasAnyPermission) {
        return null;
    }

    // Убеждаемся, что позиция корректна и меню не выходит за границы экрана
    const menuX = Math.min(position.x, window.innerWidth - 250);
    const menuY = Math.min(position.y, window.innerHeight - 200);

    return (
        <>
            <div 
                ref={menuRef}
                className="member-context-menu"
                style={{
                    position: 'fixed',
                    left: `${menuX}px`,
                    top: `${menuY}px`,
                    zIndex: 10000
                }}
            >
                <div className="context-menu-header">
                    <span className="member-name">{member.nickname || member.user?.username}</span>
                </div>
                
                <div className="context-menu-divider" />
                
                {canKick && (
                    <button 
                        className="context-menu-item danger"
                        onClick={handleKick}
                    >
                        <span className="icon">👢</span>
                        {t('serverMembers.kick') || 'Исключить'}
                    </button>
                )}
                
                {canBan && (
                    <button 
                        className="context-menu-item danger"
                        onClick={() => setShowBanModal(true)}
                    >
                        <span className="icon">🔨</span>
                        {t('serverMembers.ban') || 'Забанить'}
                    </button>
                )}
                
                {canManageRoles && (
                    <>
                        <div className="context-menu-divider" />
                        <button 
                            className="context-menu-item"
                            onClick={() => {
                                setShowRolesModal(true);
                                onClose();
                            }}
                        >
                            <span className="icon">🎭</span>
                            {t('serverSettings.manageRoles') || 'Управление ролями'}
                        </button>
                    </>
                )}
                
                {(canMute || canDeafen) && (
                    <>
                        <div className="context-menu-divider" />
                        {canMute && (
                            <label className="context-menu-item checkbox">
                                <input
                                    type="checkbox"
                                    checked={isMuted}
                                    onChange={handleMuteToggle}
                                />
                                <span className="icon">🔇</span>
                                {t('serverMembers.mute') || 'Заглушить'}
                            </label>
                        )}
                        {canDeafen && (
                            <label className="context-menu-item checkbox">
                                <input
                                    type="checkbox"
                                    checked={isDeafened}
                                    onChange={handleDeafenToggle}
                                />
                                <span className="icon">🔊</span>
                                {t('serverMembers.deafen') || 'Отключить звук'}
                            </label>
                        )}
                    </>
                )}
            </div>
            
            <BanModal
                isOpen={showBanModal}
                onClose={() => setShowBanModal(false)}
                onConfirm={handleBan}
            />
            
            {showRolesModal && (
                <MemberRolesModal
                    isOpen={showRolesModal}
                    member={member}
                    serverId={serverId}
                    roles={roles}
                    onClose={() => setShowRolesModal(false)}
                    onUpdate={() => {
                        onMemberUpdate?.();
                        setShowRolesModal(false);
                    }}
                />
            )}
        </>
    );
};

export default MemberContextMenu;

