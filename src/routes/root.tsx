import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from '../store/ProtectedRoute';
import AdminRoute from '../store/AdminRoute';
import ProfileDemo from '../components/ProfileDemo';
import Layout from '../app/layout/Main';
import AdminPanel from '../modules/admin/pages/AdminPanel';
import Auth from '../modules/auth/pages/Auth';
import InvitePage from '../modules/invite/pages/InvitePage';
import { MessageList } from '../modules/messaging';
import ChannelPage from '../modules/servers/pages/channelPage/ChannelPage';
import ServerSettings from '../modules/servers/pages/serverSettings/ServerSettings';
import WelcomePage from '../modules/servers/pages/welcomePage/WelcomePage';
import Settings from '../modules/settings/pages/Settings';
import { VoiceRoom } from '../modules/voice';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/',
                element: <WelcomePage />,
            },
            {
                path: 'server/:serverId',
                element: <ChannelPage />,
                children: [
                    {
                        path: 'voiceRoom/:roomId',
                        element: <VoiceRoom />,
                    },
                    {
                        path: 'textRoom/:roomId',
                        element: <MessageList />,
                    },
                ],
            },
            {
                path: 'server/:serverId/settings',
                element: <ServerSettings />,
            },
            {
                path: 'settings',
                element: <Settings />,
            },
            {
                path: 'profile-demo',
                element: <ProfileDemo />,
            },
            {
                path: 'admin',
                element: (
                    <AdminRoute>
                        <AdminPanel />
                    </AdminRoute>
                ),
            },
        ],
    },
    {
        path: '/auth',
        element: <Auth />, // Public route
    },
    {
        path: '/invite/:token',
        element: <InvitePage />, // Public route for invites
    },
]);
