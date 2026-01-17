import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import ServerSidebar from '../../modules/servers/components/serverSidebar/ServerSidebar';
import VoiceControls from '../../modules/servers/pages/channelPage/components/channelSidebar/components/voiceControls/VoiceControls';
import { UserProfileProvider } from '../../components/UserProfileProvider';
import ToastNotifications from '../../components/toastNotifications/ToastNotifications';
import voiceRoomStore from '../../modules/voice/store/roomStore';

import './Main.scss';

const Layout = observer(() => {
    // Проверяем подключение к голосовому каналу напрямую из store
    const isConnectedToVoice = voiceRoomStore.currentVoiceChannel !== null;
    const currentChannel = voiceRoomStore.currentVoiceChannel;

    // Показываем VoiceControls сразу при подключении к голосовому каналу
    const shouldShowVoiceControls = isConnectedToVoice;

    // Логирование для отладки
    console.warn('Layout - isConnectedToVoice:', isConnectedToVoice, 'currentChannel:', currentChannel);

    return (
        <UserProfileProvider>
            <div className={`main-page ${shouldShowVoiceControls ? 'with-voice-controls' : ''}`}>
                <ToastNotifications />
                {shouldShowVoiceControls ? <VoiceControls /> : null}
                <ServerSidebar />
                <div className="content-page">
                    <div className="content-wrapper">
                        <Outlet />
                    </div>
                </div>
            </div>
        </UserProfileProvider>
    );
});

export default Layout;
