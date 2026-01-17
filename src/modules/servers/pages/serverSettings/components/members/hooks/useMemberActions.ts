import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { serverMembersService, Permissions, hasPermission } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import type { ServerMember } from '../../../../../../modules/servers';

interface UseMemberActionsProps {
    member: ServerMember;
    serverId: number;
    currentUserPermissions: string | bigint;
    onUpdate: () => void;
}

export const useMemberActions = ({ member, serverId, currentUserPermissions, onUpdate }: UseMemberActionsProps) => {
    const { t } = useTranslation();
    const [isMuted, setIsMuted] = useState(member.isMuted || false);
    const [isDeafened, setIsDeafened] = useState(member.isDeafened || false);

    const canKick = hasPermission(currentUserPermissions, Permissions.KICK_MEMBERS);
    const canBan = hasPermission(currentUserPermissions, Permissions.BAN_MEMBERS);
    const canMute = hasPermission(currentUserPermissions, Permissions.MUTE_MEMBERS);
    const canDeafen = hasPermission(currentUserPermissions, Permissions.DEAFEN_MEMBERS);
    const canManageRoles = hasPermission(currentUserPermissions, Permissions.MANAGE_ROLES);

    const handleKick = useCallback(async () => {
        const memberName = member.nickname || member.user?.username;
        const confirmMessage = t('serverMembers.kickConfirm') || `Вы уверены, что хотите исключить ${memberName}?`;
        // eslint-disable-next-line no-alert
        if (!confirm(confirmMessage)) {
            return;
        }
        try {
            await serverMembersService.kickMember(serverId, member.id);
            notificationStore.addNotification(t('serverMembers.memberKicked') || 'Участник исключен', 'success');
            onUpdate();
        } catch (error) {
            console.error('Error kicking member:', error);
            notificationStore.addNotification(
                t('serverMembers.kickError') || 'Ошибка при исключении участника',
                'error'
            );
        }
    }, [member, serverId, onUpdate, t]);

    const handleBan = useCallback(async () => {
        const reason = prompt(t('serverMembers.banReason') || 'Причина бана (необязательно):');
        try {
            await serverMembersService.banMember(serverId, member.id, reason || undefined);
            notificationStore.addNotification(t('serverMembers.memberBanned') || 'Участник забанен', 'success');
            onUpdate();
        } catch (error) {
            console.error('Error banning member:', error);
            notificationStore.addNotification(t('serverMembers.banError') || 'Ошибка при бане участника', 'error');
        }
    }, [member, serverId, onUpdate, t]);

    const handleMuteToggle = useCallback(async () => {
        try {
            const newMuted = !isMuted;
            await serverMembersService.updateVoiceSettings(serverId, member.id, newMuted, isDeafened);
            setIsMuted(newMuted);
            notificationStore.addNotification(
                newMuted
                    ? t('serverMembers.memberMuted') || 'Участник заглушен'
                    : t('serverMembers.memberUnmuted') || 'Участник разглушен',
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error toggling mute:', error);
        }
    }, [isMuted, isDeafened, member, serverId, onUpdate, t]);

    const handleDeafenToggle = useCallback(async () => {
        try {
            const newDeafened = !isDeafened;
            await serverMembersService.updateVoiceSettings(serverId, member.id, isMuted, newDeafened);
            setIsDeafened(newDeafened);
            notificationStore.addNotification(
                newDeafened
                    ? t('serverMembers.memberDeafened') || 'Участнику отключен звук'
                    : t('serverMembers.memberUndeafened') || 'Участнику включен звук',
                'success'
            );
            onUpdate();
        } catch (error) {
            console.error('Error toggling deafen:', error);
        }
    }, [isMuted, isDeafened, member, serverId, onUpdate, t]);

    return {
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
    };
};
