/* eslint-disable max-lines-per-function, complexity */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { authStore, notificationStore } from '../../../core';
import { inviteService } from '../../../modules/invite';
import './InvitePage.scss';

interface InviteData {
    id: number;
    token: string;
    serverId: number;
    maxUses?: number;
    uses: number;
    expiresAt?: string;
}

interface ServerData {
    id: number;
    name: string;
    description?: string;
    icon?: string;
}

const InvitePage: React.FC = observer(() => {
    const { t } = useTranslation();
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<InviteData | null>(null);
    const [serverData, setServerData] = useState<ServerData | null>(null);
    const [accepting, setAccepting] = useState(false);

    const isAuthenticated = authStore.isAuthenticated;

    console.warn('InvitePage rendered with token:', token);

    const fetchInviteData = useCallback(async () => {
        if (token == null || token === '') {
            setError(t('invitePage.invalidToken'));
            setLoading(false);
            return;
        }

        console.warn('🎯 InvitePage: Получение данных приглашения для токена:', token);

        try {
            // Используем сервис для получения данных приглашения
            const fetchedInviteData = await inviteService.getInvite(token);
            console.warn('🎯 InvitePage: Данные приглашения получены:', fetchedInviteData);

            setInviteData(fetchedInviteData);

            // Получаем данные сервера отдельно (пока что используем заглушку)
            // TODO: Добавить метод в inviteService для получения данных сервера
            setServerData({
                id: fetchedInviteData.serverId,
                name: `${t('invitePage.serverFallback')} ${fetchedInviteData.serverId}`, // Временная заглушка
                description: t('invitePage.serverDescription')
            });
        } catch (err) {
            console.error('🎯 InvitePage: Ошибка получения данных приглашения:', err);
            const errorMessage = err instanceof Error ? err.message : t('invitePage.error');
            setError(errorMessage);
            notificationStore.addNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        if (token != null && token !== '') {
            fetchInviteData().catch((error: unknown) => {
                console.error('Error fetching invite data:', error);
            });
        }
    }, [token, fetchInviteData]);

    const handleAcceptInvite = async () => {
        if (token == null || token === '') {
            setError(t('invitePage.invalidToken'));
            return;
        }

        if (!isAuthenticated) {
            // Перенаправляем на страницу входа с возвратом на эту страницу
            const result = navigate(`/auth?redirect=/invite/${token}`);
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Navigation error:', error);
                });
            }
            return;
        }

        setAccepting(true);
        try {
            console.warn('🎯 InvitePage: Принятие приглашения с токеном:', token);

            // Используем сервис для принятия приглашения
            await inviteService.acceptInvite(token);

            console.warn('🎯 InvitePage: Приглашение принято успешно');

            // Перенаправляем на сервер
            if (serverData?.id != null && serverData.id !== 0) {
                const result = navigate(`/server/${serverData.id}`);
                if (result instanceof Promise) {
                    result.catch((error: unknown) => {
                        console.error('Navigation error:', error);
                    });
                }
            }
            notificationStore.addNotification(t('invitePage.joinSuccess'), 'success');
        } catch (err) {
            console.error('🎯 InvitePage: Ошибка принятия приглашения:', err);
            const errorMessage = err instanceof Error ? err.message : t('notifications.inviteAcceptError');
            setError(errorMessage);
            notificationStore.addNotification(errorMessage, 'error');
        } finally {
            setAccepting(false);
        }
    };

    const handleLogin = () => {
        const result = navigate(`/auth?redirect=/invite/${token ?? ''}`);
        if (result instanceof Promise) {
            result.catch((error: unknown) => {
                console.error('Navigation error:', error);
            });
        }
    };

    if (loading) {
        return (
            <div className="invite-page">
                <div className="invite-container">
                    <div className="loading">{t('invitePage.loading')}</div>
                </div>
            </div>
        );
    }

    if (error != null && error !== '') {
        return (
            <div className="invite-page">
                <div className="invite-container">
                    <div className="error">
                        <h2>{t('invitePage.error')}</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => {
                                const result = navigate('/');
                                if (result instanceof Promise) {
                                    result.catch((navError: unknown) => {
                                        console.error('Navigation error:', navError);
                                    });
                                }
                            }}
                            className="btn-primary"
                        >
                            {t('invitePage.backToHome')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!inviteData || !serverData) {
        return (
            <div className="invite-page">
                <div className="invite-container">
                    <div className="error">
                        <h2>{t('invitePage.error')}</h2>
                        <p>{t('invitePage.expiredOrDeleted')}</p>
                        <button
                            onClick={() => {
                                const result = navigate('/');
                                if (result instanceof Promise) {
                                    result.catch((navError: unknown) => {
                                        console.error('Navigation error:', navError);
                                    });
                                }
                            }}
                            className="btn-primary"
                        >
                            {t('invitePage.backToHome')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="invite-page">
            <div className="invite-container">
                <div className="invite-header">
                    <h1>{t('invitePage.title')}</h1>
                </div>

                <div className="server-info">
                    <div className="server-icon">
                        {serverData.icon != null && serverData.icon !== '' ? (
                            <img src={serverData.icon} alt={serverData.name} />
                        ) : (
                            <span>{serverData.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="server-details">
                        <h2>{serverData.name}</h2>
                        {serverData.description != null && serverData.description !== '' ? (
                            <p className="server-description">{serverData.description}</p>
                        ) : null}
                    </div>
                </div>

                <div className="invite-details">
                    <div className="invite-stat">
                        <span className="label">{t('invitePage.usesLabel')}</span>
                        <span className="value">
                            {inviteData.uses}/
                            {inviteData.maxUses != null && inviteData.maxUses !== 0 ? inviteData.maxUses : '∞'}
                        </span>
                    </div>
                    {inviteData.expiresAt != null && inviteData.expiresAt !== '' ? (
                        <div className="invite-stat">
                            <span className="label">{t('invitePage.expiresLabel')}</span>
                            <span className="value">{new Date(inviteData.expiresAt).toLocaleDateString()}</span>
                        </div>
                    ) : null}
                </div>

                <div className="invite-actions">
                    {isAuthenticated ? (
                        <button
                            onClick={() => {
                                handleAcceptInvite().catch((error: unknown) => {
                                    console.error('Accept invite error:', error);
                                });
                            }}
                            disabled={accepting}
                            className="btn-accept"
                        >
                            {accepting ? t('invitePage.joining') : t('invitePage.joinServer')}
                        </button>
                    ) : (
                        <div className="auth-required">
                            <p>{t('invitePage.loginRequired')}</p>
                            <button onClick={handleLogin} className="btn-login">
                                {t('invitePage.loginButton')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default InvitePage;
