import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverMembersService } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import type { BanInfo } from '../../../../../../modules/servers';
import './BansSettings.scss';

interface BansSettingsProps {
    currentUserPermissions?: string | bigint;
}

const BansSettings: React.FC<BansSettingsProps> = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [bans, setBans] = useState<BanInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const loadBans = useCallback(async () => {
        if (!serverId) {
            return;
        }

        setLoading(true);
        try {
            const bansData = await serverMembersService.getBans(parseInt(serverId));
            setBans(bansData);
        } catch (error) {
            console.error('Error loading bans:', error);
            notificationStore.addNotification(
                t('serverSettings.bansLoadError') || 'Ошибка загрузки бан-листа',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [serverId, t]);

    useEffect(() => {
        loadBans();
    }, [loadBans]);

    const handleUnban = async (userId: number) => {
        if (!serverId) {
            return;
        }

        if (!confirm(t('serverSettings.confirmUnban') || 'Вы уверены, что хотите разбанить этого пользователя?')) {
            return;
        }

        try {
            await serverMembersService.unbanMember(parseInt(serverId), userId);
            await loadBans();
            notificationStore.addNotification(t('serverSettings.userUnbanned') || 'Пользователь разбанен', 'success');
        } catch (error) {
            console.error('Error unbanning user:', error);
            notificationStore.addNotification(
                t('serverSettings.unbanError') || 'Ошибка при разбане пользователя',
                'error'
            );
        }
    };

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
                    <h2>{t('serverSettings.bans') || 'Бан-лист'}</h2>
                    <p>{t('serverSettings.bansDescription') || 'Управление забаненными пользователями'}</p>
                </div>
            </div>

            <div className="section-content">
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🚫</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.bannedUsers') || 'Забаненные пользователи'}</h3>
                                <p>
                                    {t('serverSettings.bannedUsersDescription') ||
                                        'Список пользователей, забаненных на этом сервере'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {bans.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">✅</div>
                                <h3>{t('serverSettings.noBans') || 'Нет забаненных пользователей'}</h3>
                                <p>
                                    {t('serverSettings.noBansDescription') ||
                                        'На этом сервере пока нет забаненных пользователей'}
                                </p>
                            </div>
                        ) : (
                            <div className="bans-list">
                                {bans.map((ban) => (
                                    <div key={ban.id} className="ban-item">
                                        <div className="ban-user-info">
                                            {ban.user && (
                                                <>
                                                    <img
                                                        src={ban.user.profilePicture || '/default-avatar.png'}
                                                        alt={ban.user.username}
                                                        className="ban-avatar"
                                                    />
                                                    <div className="ban-details">
                                                        <span className="ban-username">{ban.user.username}</span>
                                                        {ban.reason && (
                                                            <span className="ban-reason">
                                                                {t('serverSettings.banReason') || 'Причина'}:{' '}
                                                                {ban.reason}
                                                            </span>
                                                        )}
                                                        <span className="ban-date">
                                                            {t('serverSettings.bannedAt') || 'Забанен'}:{' '}
                                                            {new Date(ban.bannedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            className="unban-button"
                                            onClick={() => ban.user && handleUnban(ban.user.id)}
                                        >
                                            {t('serverSettings.unban') || 'Разбанить'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default BansSettings;
