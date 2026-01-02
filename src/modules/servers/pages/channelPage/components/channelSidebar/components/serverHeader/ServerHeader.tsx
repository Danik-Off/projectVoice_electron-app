// src/components/ChannelSidebar/ServerHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ServerMember } from '../../../../../../../../types/server';
import './ServerHeader.scss';
import { notificationStore, authStore } from '../../../../../../../../core';
import { inviteService } from '../../../../../../../invite';
import serverStore from '../../../../../../store/serverStore';
import InviteModal from './components/InviteModal/InviteModal';
import { getRoleIcon, getRoleColor } from './utils/roleHelpers';


const ServerHeader: React.FC = observer(() => {
    const { t } = useTranslation();
    const currentServer = serverStore.currentServer;
    const navigate = useNavigate();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Позиционирование tooltip
    useEffect(() => {
        if (showTooltip && tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            if (rect.right > window.innerWidth - 20) {
                tooltipRef.current.style.right = '0';
                tooltipRef.current.style.left = 'auto';
            }
        }
    }, [showTooltip]);

    const handleShare = async () => {
        if (!currentServer) return;
        
        setIsCreatingInvite(true);
        try {
            console.log('🎯 ServerHeader: Создание приглашения для сервера', currentServer.id);
            
            // Используем правильный сервис для создания приглашения
            const invite = await inviteService.createInvite(currentServer.id);
            
            console.log('🎯 ServerHeader: Приглашение создано', invite);
            
            // Формируем ссылку для приглашения
            const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
            setInviteLink(inviteUrl);
            setShowInviteModal(true);
            
            notificationStore.addNotification(t('serverHeader.notifications.inviteCreated'), 'success');
        } catch (error) {
            console.error('🎯 ServerHeader: Ошибка создания приглашения:', error);
            notificationStore.addNotification(
                error instanceof Error ? error.message : t('serverHeader.notifications.inviteCreateError'), 
                'error'
            );
        } finally {
            setIsCreatingInvite(false);
        }
    };

    const handleEditServer = () => {
        if (currentServer) {
            navigate(`/server/${currentServer.id}/settings`);
        }
    };

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            // Показываем уведомление об успешном копировании
            setShowTooltip(true);
            notificationStore.addNotification(t('serverHeader.notifications.linkCopied'), 'success');
            setTimeout(() => setShowTooltip(false), 2000);
        } catch (error) {
            console.error('Ошибка копирования:', error);
            notificationStore.addNotification(t('serverHeader.notifications.copyError'), 'error');
        }
    };

    const closeInviteModal = () => {
        setShowInviteModal(false);
        setInviteLink('');
    };

    // Проверяем права пользователя на сервере
    const currentUserId = authStore.user?.id;
    const isOwner = currentServer?.ownerId === currentUserId;
    const userMember = currentServer?.members?.find(
        (member: ServerMember) => member.userId === currentUserId
    );
    const userRole = userMember?.role || (isOwner ? 'owner' : 'member');

    const canInvite = ['owner', 'admin', 'moderator'].includes(userRole);
    const canEditServer = ['owner', 'admin'].includes(userRole);

    if (!currentServer) {
        return (
            <div className="server-header server-header--no-server">
                <div className="server-header__no-server-state">
                    <div className="server-header__no-server-icon">🏠</div>
                    <span className="server-header__no-server-text">{t('serverHeader.selectServer')}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="server-header">
                <div className="server-header__info">
                    <div className="server-header__info-left">
                        <div>
                            {currentServer.icon ? (
                                <img 
                                    src={currentServer.icon} 
                                    alt={`${currentServer.name} icon`} 
                                />
                            ) : (
                                <span>
                                    {currentServer.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="server-header__info-right">
                            <h2 title={currentServer.name}>
                                {currentServer.name}
                            </h2>
                        </div>
                    </div>
                    <div className="server-header__meta">
                        <div 
                            className="server-header__role"
                            style={{ '--role-color': getRoleColor(userRole) } as React.CSSProperties}
                        >
                            <span>{getRoleIcon(userRole)}</span>
                            <span>{t(`serverHeader.roles.${userRole}`)}</span>
                        </div>
                        {currentServer.members && (
                            <div className="server-header__members">
                                <span>👥</span>
                                <span>{currentServer.members.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="server-header__actions">
                    {canInvite && (
                        <button 
                            onClick={handleShare}
                            disabled={isCreatingInvite}
                            title={t('serverHeader.inviteMembers')}
                        >
                            {isCreatingInvite ? (
                                <div></div>
                            ) : (
                                <span>📤</span>
                            )}
                        </button>
                    )}
                    
                    {canEditServer && (
                        <button 
                            onClick={handleEditServer}
                            title={t('serverHeader.serverSettings')}
                        >
                            <span>⚙️</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Модальное окно с приглашением */}
            <InviteModal 
                isOpen={showInviteModal}
                onClose={closeInviteModal}
                serverName={currentServer.name}
                serverIcon={currentServer.icon}
                inviteLink={inviteLink}
                onCopy={copyInviteLink}
            />

        </>
    );
});

export default ServerHeader;
