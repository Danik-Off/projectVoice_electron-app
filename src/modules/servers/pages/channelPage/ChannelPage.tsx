import { Outlet, useParams, useNavigate } from 'react-router-dom';
import './ChannelPage.scss'; // Assuming you have a separate CSS file for styling
import ChannelSidebar from './components/channelSidebar/ChannelSidebar';
import VoiceControls from './components/channelSidebar/components/voiceControls/VoiceControls';
import BlockedServerModal from '../../../../components/BlockedServerModal';
import { useEffect, useState } from 'react';
import { serverStore } from '../../../../modules/servers';
import { eventBus, VOICE_EVENTS, notificationStore } from '../../../../core';
import Spinner from '../../../../components/spinner/Spinner';
import { observer } from 'mobx-react';
import type { VoiceChannelConnectedEvent } from '../../../../core/events/events';

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
    const [isVoiceConnected, setIsVoiceConnected] = useState(false);

    useEffect(() => {
        // Подписка на события голосового канала
        const unsubscribeConnected = eventBus.on<VoiceChannelConnectedEvent>(VOICE_EVENTS.CHANNEL_CONNECTED, () => {
            setIsVoiceConnected(true);
        });

        const unsubscribeDisconnected = eventBus.on(VOICE_EVENTS.CHANNEL_DISCONNECTED, () => {
            setIsVoiceConnected(false);
        });

        return () => {
            unsubscribeConnected();
            unsubscribeDisconnected();
        };
    }, []);

    return (
        <>
            {!serverStore.loading ? (
                <div className={`channel-page ${isVoiceConnected ? 'with-voice-controls' : ''}`}>
                    <ChannelSidebar />
                    <div className="channel-content">
                        <Outlet />
                    </div>
                    {isVoiceConnected ? <VoiceControls /> : null}
                </div>
            ) : (
                <LoadingState />
            )}
        </>
    );
});

const ChannelPage = () => {
    const { serverId } = useParams<{ serverId: string }>();
    const navigate = useNavigate();
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    useEffect(() => {
        if (serverId) {
            const id = Number(serverId);
            // Всегда загружаем сервер при изменении serverId, чтобы убедиться, что данные актуальны
            serverStore.fetchServerById(id).catch((error) => {
                console.error('Error fetching server:', error);
                notificationStore.addNotification('Ошибка загрузки сервера', 'error');
                navigate('/');
            });
        } else {
            // Если serverId отсутствует, очищаем currentServer
            if (serverStore.currentServer) {
                serverStore.currentServer = null;
            }
        }
    }, [serverId, navigate]);

    // Проверяем, заблокирован ли сервер
    useEffect(() => {
        if (serverStore.currentServer?.isBlocked) {
            setShowBlockedModal(true);
        } else {
            setShowBlockedModal(false);
        }
    }, [serverStore.currentServer]);

    const handleBlockedModalClose = () => {
        setShowBlockedModal(false);
        navigate('/'); // Перенаправляем на главную страницу
    };

    return (
        <>
            <Page />
            <BlockedServerModal
                isOpen={showBlockedModal}
                onClose={handleBlockedModalClose}
                serverName={serverStore.currentServer?.name || ''}
                reason={serverStore.currentServer?.blockReason}
                blockedAt={serverStore.currentServer?.blockedAt}
                blockedBy={serverStore.currentServer?.blockedByUser?.username}
            />
        </>
    );
};

export default ChannelPage;
