import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverMembersService, type BanInfo } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import './BansSettings.scss';

interface BansSettingsProps {
    currentUserPermissions?: string | bigint;
}

/* eslint-disable max-lines-per-function -- Complex component with multiple responsibilities */
const BansSettings: React.FC<BansSettingsProps> = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [bans, setBans] = useState<BanInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const loadBans = useCallback(async () => {
        if (serverId == null || serverId.length === 0) {
            return;
        }

        setLoading(true);
        try {
            const bansData = await serverMembersService.getBans(parseInt(serverId, 10));
            setBans(bansData);
        } catch (error) {
            console.error('Error loading bans:', error);
            notificationStore.addNotification(
                t('serverSettings.bansLoadError') ?? 'Ошибка загрузки бан-листа',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [serverId, t]);

    useEffect(() => {
        loadBans().catch((error: unknown) => {
            console.error('Error in loadBans effect:', error);
        });
    }, [loadBans]);

    const handleUnban = useCallback(
        async (userId: number) => {
            if (serverId == null || serverId.length === 0) {
                return;
            }

            const confirmMessage =
                t('serverSettings.confirmUnban') ?? 'Вы уверены, что хотите разбанить этого пользователя?';
            // eslint-disable-next-line no-alert
            if (!confirm(confirmMessage)) {
                return;
            }

            try {
                await serverMembersService.unbanMember(parseInt(serverId, 10), userId);
                await loadBans();
                notificationStore.addNotification(
                    t('serverSettings.userUnbanned') ?? 'Пользователь разбанен',
                    'success'
                );
            } catch (error) {
                console.error('Error unbanning user:', error);
                notificationStore.addNotification(
                    t('serverSettings.unbanError') ?? 'Ошибка при разбане пользователя',
                    'error'
                );
            }
        },
        [serverId, t, loadBans]
    );

    const renderLoadingState = () => (
        <div className="settings-section">
            <div className="loading-state">
                <p>{t('common.loading') ?? 'Загрузка...'}</p>
            </div>
        </div>
    );

    const renderBansList = () => (
        <div className="bans-list">
            {bans.map((ban) => (
                <div key={ban.id} className="ban-item">
                    <div className="ban-user-info">
                        {ban.user != null ? (
                            <>
                                <img
                                    src={ban.user.profilePicture ?? '/default-avatar.png'}
                                    alt={ban.user.username ?? ''}
                                    className="ban-avatar"
                                />
                                <div className="ban-details">
                                    <span className="ban-username">{ban.user.username ?? ''}</span>
                                    {ban.reason != null && ban.reason.length > 0 ? (
                                        <span className="ban-reason">
                                            {t('serverSettings.banReason') ?? 'Причина'}: {ban.reason}
                                        </span>
                                    ) : null}
                                    <span className="ban-date">
                                        {t('serverSettings.bannedAt') ?? 'Забанен'}:{' '}
                                        {new Date(ban.bannedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        ) : null}
                    </div>
                    <button
                        className="unban-button"
                        onClick={() => {
                            if (ban.user != null) {
                                handleUnban(ban.user.id).catch((error: unknown) => {
                                    console.error('Error in handleUnban:', error);
                                });
                            }
                        }}
                    >
                        {t('serverSettings.unban') ?? 'Разбанить'}
                    </button>
                </div>
            ))}
        </div>
    );

    const renderEmptyState = () => (
        <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>{t('serverSettings.noBans') ?? 'Нет забаненных пользователей'}</h3>
            <p>{t('serverSettings.noBansDescription') ?? 'На этом сервере пока нет забаненных пользователей'}</p>
        </div>
    );

    if (loading) {
        return renderLoadingState();
    }

    return (
        <div className="settings-section">
            <div className="section-header">
                <div className="header-content">
                    <h2>{t('serverSettings.bans') ?? 'Бан-лист'}</h2>
                    <p>{t('serverSettings.bansDescription') ?? 'Управление забаненными пользователями'}</p>
                </div>
            </div>

            <div className="section-content">
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🚫</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.bannedUsers') ?? 'Забаненные пользователи'}</h3>
                                <p>
                                    {t('serverSettings.bannedUsersDescription') ??
                                        'Список пользователей, забаненных на этом сервере'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">{bans.length === 0 ? renderEmptyState() : renderBansList()}</div>
                </div>
            </div>
        </div>
    );
});

export default BansSettings;
