import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import './ChannelPage.scss'; // Assuming you have a separate CSS file for styling
import ChannelSidebar from './components/channelSidebar/ChannelSidebar';
import { serverStore } from '../../../../modules/servers';
import { notificationStore } from '../../../../core';
import { BlockedServerModal, Spinner } from '../../../../shared';

const LoadingState: React.FC = () => (
    <div className="loading-state">
        <div className="loading-content">
            <div className="loading-spinner-wrapper">
                <Spinner />
            </div>
            <h2 className="loading-title">Загрузка сервера...</h2>
            <p className="loading-description">Подготавливаем все каналы и настройки для вас</p>
            <div className="loading-progress">
                <div className="progress-bar">
                    <div className="progress-fill" />
                </div>
                <span className="progress-text">Инициализация...</span>
            </div>
        </div>
    </div>
);

const Page = observer(() => {
    if (serverStore.loading) {
        return <LoadingState />;
    }

    // Постоянная голосовая панель теперь рендерится один раз глобально в Main.tsx,
    // поэтому здесь она больше не дублируется.
    return (
        <div className="channel-page">
            <ChannelSidebar />
            <div className="channel-content">
                <Outlet />
            </div>
        </div>
    );
});

const ChannelPage = () => {
    const { serverId } = useParams<{ serverId: string }>();
    const navigate = useNavigate();
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    useEffect(() => {
        if (serverId != null && serverId !== '') {
            const id = Number(serverId);
            // Всегда загружаем сервер при изменении serverId, чтобы убедиться, что данные актуальны
            serverStore.fetchServerById(id).catch((error: unknown) => {
                console.error('Error fetching server:', error);
                notificationStore.addNotification('Ошибка загрузки сервера', 'error');
                const result = navigate('/');
                if (result instanceof Promise) {
                    result.catch((navError: unknown) => {
                        console.error('Navigation error:', navError);
                    });
                }
            });
        } else {
            // Если serverId отсутствует, очищаем currentServer
            if (serverStore.currentServer != null) {
                serverStore.currentServer = null;
            }
        }
    }, [serverId, navigate]);

    // Проверяем, заблокирован ли сервер
    useEffect(() => {
        const isBlocked = serverStore.currentServer?.isBlocked === true;
        setShowBlockedModal(isBlocked);
    }, []);

    const handleBlockedModalClose = () => {
        setShowBlockedModal(false);
        const result = navigate('/'); // Перенаправляем на главную страницу
        if (result instanceof Promise) {
            result.catch((error: unknown) => {
                console.error('Navigation error:', error);
            });
        }
    };

    return (
        <>
            <Page />
            <BlockedServerModal
                isOpen={showBlockedModal}
                onClose={handleBlockedModalClose}
                serverName={serverStore.currentServer?.name ?? ''}
                reason={serverStore.currentServer?.blockReason}
                blockedAt={serverStore.currentServer?.blockedAt}
                blockedBy={serverStore.currentServer?.blockedByUser?.username}
            />
        </>
    );
};

export default ChannelPage;
