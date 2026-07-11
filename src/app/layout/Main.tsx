import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import ServerSidebar from '../../modules/servers/components/serverSidebar/ServerSidebar';
import VoiceControls from '../../modules/servers/pages/channelPage/components/channelSidebar/components/voiceControls/VoiceControls';
import { UserProfileProvider, ToastNotifications } from '../../shared';

import './Main.scss';

// Панель голосового чата теперь всегда видна (как постоянная user-панель), а не
// только во время звонка - поэтому место под неё резервируется безусловно.
const Layout = observer(() => (
    <UserProfileProvider>
        <div className="main-page with-voice-controls">
            <ToastNotifications />
            <VoiceControls />
            <ServerSidebar />
            <div className="content-page">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    </UserProfileProvider>
));

export default Layout;
