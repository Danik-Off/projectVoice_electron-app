import { Outlet, useParams, useNavigate } from 'react-router-dom';
import './ChannelPage.scss';
import ChannelSidebar from './components/channelSidebar/ChannelSidebar';
import VoiceControls from './components/channelSidebar/components/voiceControls/VoiceControls';
import BlockedServerModal from '../../components/BlockedServerModal';
import { useEffect, useState } from 'react';
import { serverStore } from '../../modules/servers';
import { observer } from 'mobx-react';

// Используем новую feature-based архитектуру
import { useVoice } from '../../modules/voice';
import Spinner from '../../components/spinner/Spinner';

const LoadingState: React.FC = () => (
    <div className="loading-state">
        <div className="loading-content">
            <div className="loading-spinner-wrapper">
                <Spinner />
            </div>
            <h2 className="loading-title">Загрузка сервера...</h2>
            <p className="loading-description">
                Подготавливаем все каналы и настройки для вас
            </p>
            <div className="loading-progress">
                <div className="progress-bar">
                    <div className="progress-fill"></div>
                </div>
                <span className="progress-text">Инициализация...</span>
            </div>
        </div>
    </div>
);

const Page = observer(() => {
    // Используем хук из voice feature вместо прямого обращения к store
    const { isConnected: isVoiceConnected } = useVoice();

    return (
        <>
            {!serverStore.loading ? (
                <div className={`channel-page ${isVoiceConnected ? 'with-voice-controls' : ''}`}>
                    <ChannelSidebar />
                    <div className="channel-content">
                        <Outlet />
                    </div>
                    {isVoiceConnected && <VoiceControls />}
                </div>
            ) : (
                <LoadingState />
            )}
        </>
    );
});

const ChannelPage: React.FC = () => {
    const { serverId } = useParams<{ serverId: string }>();
    const navigate = useNavigate();
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    useEffect(() => {
        if (serverId) {
            serverStore.fetchServerById(Number(serverId)).catch((error: any) => {
                console.error('Error fetching server:', error);
                if (error.status === 403) {
                    setShowBlockedModal(true);
                } else {
                    navigate('/');
                }
            });
        }
    }, [serverId, navigate]);

    const handleCloseBlockedModal = () => {
        setShowBlockedModal(false);
        navigate('/');
    };

    return (
        <>
            <Page />
            {showBlockedModal && (
                <BlockedServerModal 
                    isOpen={showBlockedModal}
                    serverName={serverStore.currentServer?.name || ''}
                    onClose={handleCloseBlockedModal} 
                />
            )}
        </>
    );
};

export default ChannelPage;
