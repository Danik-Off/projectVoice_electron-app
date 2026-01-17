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

/* eslint-disable max-lines-per-function -- Complex sidebar with modals and navigation */
const ServerSidebar: React.FC = observer(() => {
    const navigate = useNavigate();
    const currentLocation = useLocation();
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
        const result = navigate('/settings');
        if (result instanceof Promise) {
            result.catch((error: unknown) => {
                console.error('Navigation error:', error);
            });
        }
    };

    const handleAdminPanel = () => {
        const result = navigate('/admin');
        if (result instanceof Promise) {
            result.catch((error: unknown) => {
                console.error('Navigation error:', error);
            });
        }
    };

    const handleServerClick = (server: Server) => {
        if (server.isBlocked === true) {
            setBlockedServer({
                name: server.name,
                reason: server.blockReason,
                blockedAt: server.blockedAt,
                blockedBy: server.blockedByUser?.username
            });
        } else {
            // Устанавливаем сервер сразу при клике для мгновенной реакции UI
            if (serverStore.currentServer?.id !== server.id) {
                // Предустанавливаем сервер из списка для быстрого отображения
                const serverFromList = serverStore.servers.find((s) => s.id === server.id);
                if (serverFromList != null) {
                    serverStore.currentServer = serverFromList;
                }
            }
            const result = navigate(`/server/${server.id}`);
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Navigation error:', error);
                });
            }
        }
    };

    const isOnHomePage =
        currentLocation.pathname === '/' ||
        currentLocation.pathname === '/main' ||
        currentLocation.pathname === '/welcome' ||
        currentLocation.pathname.startsWith('/auth');

    useEffect(() => {
        serverStore.fetchServers().catch((error: unknown) => {
            console.error('Error fetching servers:', error);
        });
    }, []);

    return (
        <aside className="servers">
            <div className="servers__header">
                <div
                    className={`servers__server servers__server--home ${isOnHomePage ? 'servers__server--active' : ''}`}
                    onClick={() => {
                        const result = navigate('/');
                        if (result instanceof Promise) {
                            result.catch((error: unknown) => {
                                console.error('Navigation error:', error);
                            });
                        }
                    }}
                >
                    <div className="servers__server-icon">🏠</div>
                </div>
                <div className="servers__separator" />
            </div>

            <div className="servers__list">
                {serverStore.servers.map((server) => (
                    <ServerItem
                        key={server.id}
                        server={server}
                        onClick={() => {
                            handleServerClick(server);
                        }}
                    />
                ))}
                <div className="servers__separator" />
                <div
                    className="servers__server servers__server--add"
                    onClick={() => {
                        setIsCreateModalOpen(true);
                    }}
                >
                    <div className="servers__server-icon">+</div>
                </div>
            </div>

            <div className="servers__footer">
                <div className="servers__footer-separator" />
                <div
                    className="servers__server servers__server--settings"
                    onClick={handleSetting}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const result = navigate('/settings');
                            if (result instanceof Promise) {
                                result.catch((error: unknown) => {
                                    console.error('Navigation error:', error);
                                });
                            }
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
                isOpen={blockedServer != null}
                onClose={() => setBlockedServer(null)}
                serverName={blockedServer?.name ?? ''}
                reason={blockedServer?.reason}
                blockedAt={blockedServer?.blockedAt}
                blockedBy={blockedServer?.blockedBy}
            />

            <CreateServerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </aside>
    );
});

export default ServerSidebar;
