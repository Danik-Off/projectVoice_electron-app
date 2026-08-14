import React, { useState, useEffect, useCallback, type JSX } from 'react';
import { observer } from 'mobx-react';
import { adminService, type UpdateUserRequest, type LogsResponse } from '../services/adminService';
import { authStore } from '../../../core';
import type { Channel } from '../../../types/channel';
// import { useTranslation } from 'react-i18next';
import './AdminPanel.scss';

interface Stats {
    users: {
        total: number;
        active: number;
        blocked: number;
        byRole: {
            admin: number;
            moderator: number;
            user: number;
        };
    };
    servers: {
        total: number;
        active: number;
        blocked: number;
        withChannels: number;
    };
    channels: {
        total: number;
        text: number;
        voice: number;
    };
    messages: {
        total: number;
        today: number;
    };
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

interface Server {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    createdAt: string;
    isBlocked: boolean;
    blockReason?: string;
    blockedAt?: string;
    blockedBy?: number;
    blockedByUser?: {
        id: number;
        username: string;
    };
    channels?: Channel[];
    memberCount?: number;
    owner?: {
        id: number;
        username: string;
        email: string;
    };
}

interface BlockServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBlock: (reason: string) => void;
    serverName: string;
}

const BlockServerModal: React.FC<BlockServerModalProps> = ({ isOpen, onClose, onBlock, serverName }) => {
    const [reason, setReason] = useState('');
    // const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onBlock(reason);
        setReason('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Заблокировать сервер &quot;{serverName}&quot;</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reason">Причина блокировки:</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Укажите причину блокировки сервера..."
                            rows={4}
                            required
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="button" className="button secondary" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="button primary">
                            Заблокировать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* eslint-disable max-lines-per-function, complexity, max-lines */
const AdminPanel: React.FC = observer(() => {
    // const { t } = useTranslation();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [servers, setServers] = useState<Server[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [logs, setLogs] = useState<LogsResponse | null>(null);
    const [blockModal, setBlockModal] = useState<{ isOpen: boolean; serverId: number; serverName: string }>({
        isOpen: false,
        serverId: 0,
        serverName: ''
    });

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const response = await adminService.getUsers({
                page: currentPage,
                limit: 20,
                search: searchTerm,
                role: roleFilter,
                status: statusFilter
            });
            setUsers(response.users);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    }, [currentPage, searchTerm, roleFilter, statusFilter]);

    const loadServers = useCallback(async () => {
        try {
            const response = await adminService.getServers({
                page: currentPage,
                limit: 20,
                search: searchTerm,
                status: statusFilter
            });
            setServers(response.servers);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Ошибка загрузки серверов:', error);
        }
    }, [currentPage, searchTerm, statusFilter]);

    const loadLogs = useCallback(async () => {
        try {
            const response = await adminService.getLogs();
            setLogs(response);
        } catch (error) {
            console.error('Ошибка загрузки логов:', error);
        }
    }, []);

    useEffect(() => {
        if (authStore.user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        loadStats().catch((error: unknown) => {
            console.error('Failed to load stats:', error);
        });
    }, [loadStats]);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers().catch((error: unknown) => {
                console.error('Failed to load users:', error);
            });
        } else if (activeTab === 'servers') {
            loadServers().catch((error: unknown) => {
                console.error('Failed to load servers:', error);
            });
        } else if (activeTab === 'logs') {
            loadLogs().catch((error: unknown) => {
                console.error('Failed to load logs:', error);
            });
        }
    }, [activeTab, loadUsers, loadServers, loadLogs]);

    const updateUser = async (userId: number, updates: UpdateUserRequest) => {
        try {
            const result = await adminService.updateUser(userId, updates);
            console.warn(result.message);
            loadUsers().catch((error: unknown) => {
                console.error('Failed to reload users after update:', error);
            }); // Перезагружаем список
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
        }
    };

    const deleteUser = async (userId: number) => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                const result = await adminService.deleteUser(userId);
                console.warn(result.message);
                loadUsers().catch((error: unknown) => {
                    console.error('Failed to reload users after delete:', error);
                }); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка удаления пользователя:', error);
            }
        }
    };

    const blockServer = async (serverId: number, reason: string) => {
        try {
            const result = await adminService.blockServer(serverId, { reason });
            console.warn(result.message);
            loadServers().catch((error: unknown) => {
                console.error('Failed to reload servers after block:', error);
            }); // Перезагружаем список
        } catch (error) {
            console.error('Ошибка блокировки сервера:', error);
        }
    };

    const unblockServer = async (serverId: number) => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Вы уверены, что хотите разблокировать этот сервер?')) {
            try {
                const result = await adminService.unblockServer(serverId);
                console.warn(result.message);
                loadServers().catch((error: unknown) => {
                    console.error('Failed to reload servers after unblock:', error);
                }); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка разблокировки сервера:', error);
            }
        }
    };

    const deleteServer = async (serverId: number) => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Вы уверены, что хотите удалить этот сервер?')) {
            try {
                const result = await adminService.deleteServer(serverId);
                console.warn(result.message);
                loadServers().catch((error: unknown) => {
                    console.error('Failed to reload servers after delete:', error);
                }); // Перезагружаем список
            } catch (error) {
                console.error('Ошибка удаления сервера:', error);
            }
        }
    };

    const openBlockModal = (serverId: number, serverName: string) => {
        setBlockModal({ isOpen: true, serverId, serverName });
    };

    const closeBlockModal = () => {
        setBlockModal({ isOpen: false, serverId: 0, serverName: '' });
    };

    const getRoleBadge = (role: string) => {
        const roleColors = {
            admin: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            moderator: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
            user: 'linear-gradient(135deg, var(--accent-color) 0%, var(--button-bg) 100%)'
        };

        return (
            <span className="role-badge" style={{ background: roleColors[role as keyof typeof roleColors] }}>
                {role}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => (
        <span
            className={`status-badge ${isActive ? 'active' : 'blocked'}`}
            style={{
                background: isActive
                    ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                    : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
            }}
        >
            {isActive ? 'Активен' : 'Заблокирован'}
        </span>
    );

    const getServerStatusBadge = (isBlocked: boolean) => (
        <span
            className={`status-badge ${isBlocked ? 'blocked' : 'active'}`}
            style={{
                background: isBlocked
                    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
                    : 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            }}
        >
            {isBlocked ? 'Заблокирован' : 'Активен'}
        </span>
    );

    if (loading) {
        return (
            <div className="admin-panel">
                <div className="admin-loading">
                    <div className="loading-spinner" />
                    Загрузка админ-панели...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🚀 Админ-панель ProjectVoice</h1>
                <div className="admin-user-info">
                    <span>👤 Администратор: {authStore.user?.username}</span>
                    <button onClick={() => authStore.logout()} className="logout-btn">
                        🚪 Выйти
                    </button>
                </div>
            </div>

            <div className="admin-nav">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                    📊 Дашборд
                </button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                    👥 Пользователи
                </button>
                <button className={activeTab === 'servers' ? 'active' : ''} onClick={() => setActiveTab('servers')}>
                    🏠 Серверы
                </button>
                <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                    📝 Логи
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>👥 Пользователи</h3>
                                <div className="stat-numbers">
                                    <div className="stat-main">{stats?.users.total ?? 0}</div>
                                    <div className="stat-details">
                                        <span>✅ Активных: {stats?.users.active ?? 0}</span>
                                        <span>❌ Заблокированных: {stats?.users.blocked ?? 0}</span>
                                    </div>
                                </div>
                                <div className="stat-breakdown">
                                    <div>👑 Админов: {stats?.users.byRole.admin ?? 0}</div>
                                    <div>🛡️ Модераторов: {stats?.users.byRole.moderator ?? 0}</div>
                                    <div>👤 Пользователей: {stats?.users.byRole.user ?? 0}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>🏠 Серверы</h3>
                                <div className="stat-numbers">
                                    <div className="stat-main">{stats?.servers.total ?? 0}</div>
                                    <div className="stat-details">
                                        <span>📢 С каналами: {stats?.servers.withChannels ?? 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>📢 Каналы</h3>
                                <div className="stat-numbers">
                                    <div className="stat-main">{stats?.channels.total ?? 0}</div>
                                    <div className="stat-details">
                                        <span>💬 Текстовых: {stats?.channels.text ?? 0}</span>
                                        <span>🎤 Голосовых: {stats?.channels.voice ?? 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>💬 Сообщения</h3>
                                <div className="stat-numbers">
                                    <div className="stat-main">{stats?.messages.total ?? 0}</div>
                                    <div className="stat-details">
                                        <span>📅 Сегодня: {stats?.messages.today ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h3>⚡ Быстрые действия</h3>
                            <div className="action-buttons">
                                <button onClick={() => setActiveTab('users')}>👥 Управление пользователями</button>
                                <button onClick={() => setActiveTab('servers')}>🏠 Просмотр серверов</button>
                                <button
                                    onClick={() => {
                                        loadStats().catch((error: unknown) => {
                                            console.error('Failed to refresh stats:', error);
                                        });
                                    }}
                                >
                                    🔄 Обновить статистику
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-management">
                        <h2>👥 Управление пользователями</h2>
                        {/* eslint-disable-next-line no-use-before-define */}
                        <UsersManagement
                            users={users}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            searchTerm={searchTerm}
                            roleFilter={roleFilter}
                            statusFilter={statusFilter}
                            onSearchChange={setSearchTerm}
                            onRoleFilterChange={setRoleFilter}
                            onStatusFilterChange={setStatusFilter}
                            onPageChange={setCurrentPage}
                            onUpdateUser={(userId, updates) => {
                                updateUser(userId, updates).catch((error: unknown) => {
                                    console.error('Failed to update user:', error);
                                });
                            }}
                            onDeleteUser={(userId) => {
                                deleteUser(userId).catch((error: unknown) => {
                                    console.error('Failed to delete user:', error);
                                });
                            }}
                            getRoleBadge={getRoleBadge}
                            getStatusBadge={getStatusBadge}
                        />
                    </div>
                )}

                {activeTab === 'servers' && (
                    <div className="servers-management">
                        <h2>🏠 Управление серверами</h2>
                        {/* eslint-disable-next-line no-use-before-define */}
                        <ServersManagement
                            servers={servers}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            onSearchChange={setSearchTerm}
                            onStatusFilterChange={setStatusFilter}
                            onPageChange={setCurrentPage}
                            onBlockServer={openBlockModal}
                            onUnblockServer={(serverId) => {
                                unblockServer(serverId).catch((error: unknown) => {
                                    console.error('Failed to unblock server:', error);
                                });
                            }}
                            onDeleteServer={(serverId) => {
                                deleteServer(serverId).catch((error: unknown) => {
                                    console.error('Failed to delete server:', error);
                                });
                            }}
                            getServerStatusBadge={getServerStatusBadge}
                        />
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="logs-viewer">
                        <h2>📝 Системные логи</h2>
                        {/* eslint-disable-next-line no-use-before-define */}
                        <LogsViewer logs={logs} />
                    </div>
                )}
            </div>

            <BlockServerModal
                isOpen={blockModal.isOpen}
                onClose={closeBlockModal}
                onBlock={(reason) => {
                    blockServer(blockModal.serverId, reason).catch((error: unknown) => {
                        console.error('Failed to block server:', error);
                    });
                }}
                serverName={blockModal.serverName}
            />
        </div>
    );
});

// Компонент управления пользователями
const UsersManagement: React.FC<{
    users: User[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onRoleFilterChange: (value: string) => void;
    onStatusFilterChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onUpdateUser: (userId: number, updates: UpdateUserRequest) => void;
    onDeleteUser: (userId: number) => void;
    getRoleBadge: (role: string) => JSX.Element;
    getStatusBadge: (isActive: boolean) => JSX.Element;
}> = ({
    users,
    currentPage,
    totalPages,
    searchTerm,
    roleFilter,
    statusFilter,
    onSearchChange,
    onRoleFilterChange,
    onStatusFilterChange,
    onPageChange,
    onUpdateUser,
    onDeleteUser,
    getRoleBadge,
    getStatusBadge
}) => (
    <>
        <div className="filters">
            <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => onRoleFilterChange(e.target.value)}>
                <option value="">Все роли</option>
                <option value="admin">Админ</option>
                <option value="moderator">Модератор</option>
                <option value="user">Пользователь</option>
            </select>
            <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
            </select>
        </div>

        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя пользователя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Дата регистрации</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>{getStatusBadge(user.isActive)}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                                >
                                    <option value="user">Пользователь</option>
                                    <option value="moderator">Модератор</option>
                                    <option value="admin">Админ</option>
                                </select>
                                <button
                                    onClick={() => onUpdateUser(user.id, { isActive: !user.isActive })}
                                    className={`status-toggle ${user.isActive ? 'block' : 'unblock'}`}
                                >
                                    {user.isActive ? '🚫 Заблокировать' : '✅ Разблокировать'}
                                </button>
                                <button onClick={() => onDeleteUser(user.id)} className="delete-btn">
                                    🗑️ Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Предыдущая
            </button>
            <span>
                Страница {currentPage} из {totalPages}
            </span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Следующая →
            </button>
        </div>
    </>
);

// Компонент управления серверами
const ServersManagement: React.FC<{
    servers: Server[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onBlockServer: (serverId: number, serverName: string) => void;
    onUnblockServer: (serverId: number) => void;
    onDeleteServer: (serverId: number) => void;
    getServerStatusBadge: (isBlocked: boolean) => JSX.Element;
}> = ({
    servers,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onPageChange,
    onBlockServer,
    onUnblockServer,
    onDeleteServer,
    getServerStatusBadge
}) => (
    <>
        <div className="filters">
            <input
                type="text"
                placeholder="Поиск по названию сервера..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
            </select>
        </div>

        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Владелец</th>
                        <th>Каналов</th>
                        <th>Участников</th>
                        <th>Дата создания</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {servers.map((server) => (
                        <tr key={server.id}>
                            <td>{server.id}</td>
                            <td>{server.name}</td>
                            <td>{server.description ?? 'Нет описания'}</td>
                            <td>{server.ownerId}</td>
                            <td>{server.channels?.length ?? 0}</td>
                            <td>{server.memberCount ?? 0}</td>
                            <td>{new Date(server.createdAt).toLocaleDateString()}</td>
                            <td>{getServerStatusBadge(server.isBlocked)}</td>
                            <td>
                                {server.isBlocked ? (
                                    <button onClick={() => onUnblockServer(server.id)} className="unblock-btn">
                                        ✅ Разблокировать
                                    </button>
                                ) : (
                                    <button onClick={() => onBlockServer(server.id, server.name)} className="block-btn">
                                        🚫 Заблокировать
                                    </button>
                                )}
                                <button onClick={() => onDeleteServer(server.id)} className="delete-btn">
                                    🗑️ Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Предыдущая
            </button>
            <span>
                Страница {currentPage} из {totalPages}
            </span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Следующая →
            </button>
        </div>
    </>
);

// Компонент просмотра логов
const LogsViewer: React.FC<{ logs: LogsResponse | null }> = ({ logs }) => {
    if (logs == null) {
        return <div>Загрузка логов...</div>;
    }

    return (
        <div className="logs-content">
            <div className="log-section">
                <h3>📋 Логи системы ({logs.total} записей)</h3>
                {logs.logs.length > 0 ? <pre>{logs.logs.join('\n')}</pre> : <pre>Нет логов</pre>}
            </div>
        </div>
    );
};

export default AdminPanel;
