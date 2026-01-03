import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../../../../core';
import BlockedServerModal from '../../../../components/BlockedServerModal';
import CreateServerModal from './components/CreateServerModal/CreateServerModal';
import type { Server } from '../../../../types/server';
import ServerItem from '../../../../app/layout/components/serverSlidebar/serverItem/ServerItem';
import serverStore from '../../store/serverStore';
import './ServerSidebar.scss';

const ServerSidebar: React.FC = observer(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [blockedServer, setBlockedServer] = useState<{
        name: string;
        reason?: string;
        blockedAt?: string;
        blockedBy?: string;
    } | null>(null);

    const handleSetting = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/settings');
    };

    const handleAdminPanel = () => {
        navigate('/admin');
    };

    const handleServerClick = (server: Server) => {
        if (server.isBlocked) {
            setBlockedServer({
                name: server.name,
                reason: server.blockReason,
                blockedAt: server.blockedAt,
                blockedBy: server.blockedByUser?.username
            });
        } else {
            navigate(`/server/${server.id}`);
        }
    };

    const isOnHomePage = location.pathname === '/' || 
                        location.pathname === '/main' || 
                        location.pathname === '/welcome' ||
                        location.pathname.startsWith('/auth');
    
    useEffect(() => {
        serverStore.fetchServers();
    }, []);

    return (
        <aside className="servers">
            <div className="servers__header">
                <div 
                    className={`servers__server servers__server--home ${isOnHomePage ? 'servers__server--active' : ''}`} 
                    onClick={() => navigate('/')}
                >
                    <div className="servers__server-icon">🏠</div>
                </div>
                <div className="servers__separator"></div>
            </div>
            
            <div className="servers__list">
                {serverStore.servers.map((server) => (
                    <ServerItem 
                        key={server.id} 
                        server={server} 
                        onClick={() => handleServerClick(server)}
                    />
                ))}
                <div className="servers__separator"></div>
                <div className="servers__server servers__server--add" onClick={() => {
                    setIsCreateModalOpen(true);
                }}>
                    <div className="servers__server-icon">+</div>
                </div>
            </div>
            
            <div className="servers__footer">
                <div className="servers__footer-separator"></div>
                <div 
                    className="servers__server servers__server--settings" 
                    onClick={handleSetting}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('/settings');
                        }
                    }}
                >
                    <div className="servers__server-icon">⚙️</div>
                </div>
                {authStore.user?.role === 'admin' && (
                    <div className="servers__server servers__server--admin" onClick={handleAdminPanel}>
                        <div className="servers__server-icon">👑</div>
                    </div>
                )}
            </div>

            <BlockedServerModal
                isOpen={!!blockedServer}
                onClose={() => setBlockedServer(null)}
                serverName={blockedServer?.name || ''}
                reason={blockedServer?.reason}
                blockedAt={blockedServer?.blockedAt}
                blockedBy={blockedServer?.blockedBy}
            />

            <CreateServerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </aside>
    );
});

export default ServerSidebar;

