import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import './UserProfileModal.scss';
import type { User } from '../../types/user';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    isOwnProfile?: boolean;
}

/* eslint-disable max-lines-per-function, complexity */
const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, isOwnProfile = false }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'servers' | 'friends'>('overview');
    const [showEditMode, setShowEditMode] = useState(false);
    const [editData, setEditData] = useState({
        username: user?.username ?? '',
        status: user?.status ?? 'online',
        about: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Сброс активной вкладки при открытии
            setActiveTab('overview');
            setShowEditMode(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (user !== null) {
            setEditData({
                username: user.username ?? '',
                status: user.status ?? 'online',
                about:
                    user.status === 'online'
                        ? 'Этот пользователь сейчас в сети и доступен для общения.'
                        : 'Этот пользователь сейчас не в сети или невидим.'
            });
        }
    }, [user]);

    if (!isOpen || !user) {
        return null;
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    const getStatusColor = (userStatus?: string) => {
        if (userStatus == null) {
            return '#9E9E9E';
        }
        switch (userStatus) {
            case 'online':
                return '#4CAF50';
            case 'idle':
                return '#FF9800';
            case 'dnd':
                return '#F44336';
            case 'invisible':
                return '#9E9E9E';
            default:
                return '#9E9E9E';
        }
    };

    const getStatusText = (userStatus?: string) => {
        if (userStatus == null) {
            return t('userProfile.status.offline');
        }
        switch (userStatus) {
            case 'online':
                return t('userProfile.status.online');
            case 'idle':
                return t('userProfile.status.idle');
            case 'dnd':
                return t('userProfile.status.dnd');
            case 'invisible':
                return t('userProfile.status.invisible');
            default:
                return t('userProfile.status.offline');
        }
    };

    const getRoleIcon = (role?: string) => {
        if (role == null) {
            return '👤';
        }
        switch (role) {
            case 'admin':
                return '⚡';
            case 'moderator':
                return '🛡️';
            case 'member':
                return '👤';
            default:
                return '👤';
        }
    };

    const handleTabChange = (tab: 'overview' | 'activity' | 'servers' | 'friends') => {
        setActiveTab(tab);
    };

    const handleSendMessage = () => {
        // TODO: Реализовать отправку сообщения
        console.warn('Send message to:', user.username);
    };

    const handleAddFriend = () => {
        // TODO: Реализовать добавление в друзья
        console.warn('Add friend:', user.username);
    };

    const handleBlockUser = () => {
        // TODO: Реализовать блокировку пользователя
        console.warn('Block user:', user.username);
    };

    const handleEditProfile = () => {
        setShowEditMode(true);
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            // TODO: Реализовать сохранение профиля
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация API вызова
            setShowEditMode(false);
            // Обновляем данные пользователя
            if (user !== null) {
                Object.assign(user, editData);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditData({
            username: user?.username ?? '',
            status: user?.status ?? 'online',
            about:
                user?.status === 'online'
                    ? 'Этот пользователь сейчас в сети и доступен для общения.'
                    : 'Этот пользователь сейчас не в сети или невидим.'
        });
        setShowEditMode(false);
    };

    const handleStatusChange = (newStatus: string) => {
        setEditData((prev) => ({ ...prev, status: newStatus }));
    };

    const renderOverviewTab = () => (
        <div className="profile-overview">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {user.profilePicture !== null && user.profilePicture !== '' ? (
                        <img src={user.profilePicture} alt={user.username} />
                    ) : (
                        <div className="avatar-placeholder-large">{user.username.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="status-indicator" style={{ backgroundColor: getStatusColor(user.status) }} />
                </div>

                <div className="profile-info">
                    {showEditMode ? (
                        <div className="edit-mode">
                            <input
                                type="text"
                                value={editData.username}
                                onChange={(e) => setEditData((prev) => ({ ...prev, username: e.target.value }))}
                                className="edit-username-input"
                                maxLength={20}
                            />
                            <div className="status-selector">
                                <select
                                    value={editData.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="status-select"
                                >
                                    <option value="online">🟢 {t('userProfile.status.online')}</option>
                                    <option value="idle">🟡 {t('userProfile.status.idle')}</option>
                                    <option value="dnd">🔴 {t('userProfile.status.dnd')}</option>
                                    <option value="invisible">⚫ {t('userProfile.status.invisible')}</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="username">{user.username}</h3>
                            <p className="user-tag">#{user.tag ?? '0000'}</p>
                            <p className="user-status">{getStatusText(user.status)}</p>

                            {user.role !== null && user.role !== '' ? (
                                <div className="user-role">
                                    <span className="role-icon">{getRoleIcon(user.role)}</span>
                                    <span className="role-text">{t(`userProfile.roles.${user.role}`)}</span>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            <div className="profile-details">
                <div className="detail-section">
                    <h4>{t('userProfile.about.title')}</h4>
                    {showEditMode ? (
                        <textarea
                            value={editData.about}
                            onChange={(e) => setEditData((prev) => ({ ...prev, about: e.target.value }))}
                            className="edit-about-textarea"
                            placeholder="Расскажите о себе..."
                            maxLength={500}
                            rows={3}
                        />
                    ) : (
                        <p className="about-text">
                            {editData.about ||
                                (user.status === 'online'
                                    ? t('userProfile.about.onlineMessage')
                                    : t('userProfile.about.offlineMessage'))}
                        </p>
                    )}
                </div>

                <div className="detail-section">
                    <h4>{t('userProfile.accountInfo.title')}</h4>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">{t('userProfile.accountInfo.email')}</span>
                            <span className="info-value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">{t('userProfile.accountInfo.memberSince')}</span>
                            <span className="info-value">
                                {user.createdAt !== null && user.createdAt !== ''
                                    ? formatDate(user.createdAt)
                                    : t('userProfile.accountInfo.unknown')}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">{t('userProfile.accountInfo.accountStatus')}</span>
                            <span className={`info-value status-${user.isActive === true ? 'active' : 'inactive'}`}>
                                {user.isActive === true
                                    ? t('userProfile.accountInfo.active')
                                    : t('userProfile.accountInfo.inactive')}
                            </span>
                        </div>
                    </div>
                </div>

                {user.blockedAt !== null && user.blockedAt !== '' ? (
                    <div className="detail-section warning">
                        <h4>{t('userProfile.blockedAccount.title')}</h4>
                        <p className="warning-text">{t('userProfile.blockedAccount.message')}</p>
                        <div className="block-details">
                            <p>
                                <strong>{t('userProfile.blockedAccount.reason')}:</strong> {user.blockReason ?? ''}
                            </p>
                            <p>
                                <strong>{t('userProfile.blockedAccount.blockedAt')}:</strong>{' '}
                                {formatDate(user.blockedAt)}
                            </p>
                            {user.blockedBy !== null && user.blockedBy !== '' ? (
                                <p>
                                    <strong>{t('userProfile.blockedAccount.blockedBy')}:</strong> {user.blockedBy}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );

    const renderActivityTab = () => (
        <div className="profile-activity">
            <div className="activity-header">
                <h4>{t('userProfile.activity.title')}</h4>
                <p className="activity-subtitle">{t('userProfile.activity.subtitle')}</p>
            </div>

            <div className="activity-items">
                <div className="activity-item">
                    <div className="activity-icon">📊</div>
                    <div className="activity-content">
                        <h5>{t('userProfile.activity.stats.title')}</h5>
                        <div className="activity-stats">
                            <div className="stat-item">
                                <span className="stat-number">127</span>
                                <span className="stat-label">Сообщений</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">89</span>
                                <span className="stat-label">Часов в голосе</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">15</span>
                                <span className="stat-label">Дней в сети</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="activity-item">
                    <div className="activity-icon">🎮</div>
                    <div className="activity-content">
                        <h5>{t('userProfile.activity.gaming.title')}</h5>
                        <div className="gaming-activity">
                            <div className="game-item">
                                <span className="game-name">Counter-Strike 2</span>
                                <span className="game-status playing">Играет сейчас</span>
                            </div>
                            <div className="game-item">
                                <span className="game-name">Valorant</span>
                                <span className="game-status last-played">Играл 2 часа назад</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="activity-item">
                    <div className="activity-icon">🎵</div>
                    <div className="activity-content">
                        <h5>{t('userProfile.activity.music.title')}</h5>
                        <div className="music-activity">
                            <div className="music-item">
                                <span className="song-name">&quot;Bohemian Rhapsody&quot;</span>
                                <span className="artist-name">Queen</span>
                                <span className="music-status">Слушает сейчас</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderServersTab = () => (
        <div className="profile-servers">
            <div className="servers-header">
                <h4>{t('userProfile.servers.title')}</h4>
                <p className="servers-subtitle">{t('userProfile.servers.subtitle')}</p>
            </div>

            <div className="servers-list">
                <div className="server-item">
                    <div className="server-icon">🏠</div>
                    <div className="server-info">
                        <h5>Домашний сервер</h5>
                        <p>Персональный сервер и основной центр сообщества</p>
                        <div className="server-meta">
                            <span className="member-count">👥 12 участников</span>
                            <span className="server-status online">🟢 Онлайн</span>
                        </div>
                    </div>
                </div>

                <div className="server-item">
                    <div className="server-icon">👥</div>
                    <div className="server-info">
                        <h5>Gaming Community</h5>
                        <p>Сообщество геймеров и любителей игр</p>
                        <div className="server-meta">
                            <span className="member-count">👥 156 участников</span>
                            <span className="server-status online">🟢 Онлайн</span>
                        </div>
                    </div>
                </div>

                <div className="server-item">
                    <div className="server-icon">🎯</div>
                    <div className="server-info">
                        <h5>CS2 Team</h5>
                        <p>Команда по Counter-Strike 2</p>
                        <div className="server-meta">
                            <span className="member-count">👥 8 участников</span>
                            <span className="server-status online">🟢 Онлайн</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFriendsTab = () => (
        <div className="profile-friends">
            <div className="friends-header">
                <h4>{t('userProfile.friends.title')}</h4>
                <p className="friends-subtitle">{t('userProfile.friends.subtitle')}</p>
            </div>

            <div className="friends-stats">
                <div className="stat-item">
                    <div className="stat-number">24</div>
                    <div className="stat-label">{t('userProfile.friends.stats.friends')}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">8</div>
                    <div className="stat-label">{t('userProfile.friends.stats.mutual')}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">3</div>
                    <div className="stat-label">{t('userProfile.friends.stats.servers')}</div>
                </div>
            </div>

            <div className="friends-list">
                <div className="friend-item">
                    <div className="friend-avatar">👤</div>
                    <div className="friend-info">
                        <span className="friend-name">Alex</span>
                        <span className="friend-status online">🟢 В сети</span>
                    </div>
                </div>
                <div className="friend-item">
                    <div className="friend-avatar">👤</div>
                    <div className="friend-info">
                        <span className="friend-name">Maria</span>
                        <span className="friend-status idle">🟡 Неактивен</span>
                    </div>
                </div>
                <div className="friend-item">
                    <div className="friend-avatar">👤</div>
                    <div className="friend-info">
                        <span className="friend-name">John</span>
                        <span className="friend-status offline">⚫ Не в сети</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="user-profile-modal-overlay" onClick={onClose}>
            <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <h2>{t('userProfile.title')}</h2>
                        <button className="close-button" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                </div>

                <div className="modal-content">
                    <div className="profile-tabs">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => handleTabChange('overview')}
                        >
                            {t('userProfile.tabs.overview')}
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => handleTabChange('activity')}
                        >
                            {t('userProfile.tabs.activity')}
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'servers' ? 'active' : ''}`}
                            onClick={() => handleTabChange('servers')}
                        >
                            {t('userProfile.tabs.servers')}
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                            onClick={() => handleTabChange('friends')}
                        >
                            {t('userProfile.tabs.friends')}
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'overview' && renderOverviewTab()}
                        {activeTab === 'activity' && renderActivityTab()}
                        {activeTab === 'servers' && renderServersTab()}
                        {activeTab === 'friends' && renderFriendsTab()}
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="action-buttons">
                        {!isOwnProfile && (
                            <>
                                <button className="action-button primary" onClick={handleSendMessage}>
                                    {t('userProfile.actions.sendMessage')}
                                </button>
                                <button className="action-button secondary" onClick={handleAddFriend}>
                                    {t('userProfile.actions.addFriend')}
                                </button>
                                <button className="action-button danger" onClick={handleBlockUser}>
                                    {t('userProfile.actions.blockUser')}
                                </button>
                            </>
                        )}
                        {isOwnProfile === true ? (
                            !showEditMode ? (
                                <button className="action-button primary" onClick={handleEditProfile}>
                                    ✏️ {t('userProfile.actions.editProfile')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="action-button primary"
                                        onClick={() => {
                                            handleSaveProfile().catch(() => {
                                                // Error handled in handleSaveProfile
                                            });
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '⏳ Сохранение...' : '💾 Сохранить'}
                                    </button>
                                    <button className="action-button secondary" onClick={handleCancelEdit}>
                                        ❌ Отмена
                                    </button>
                                </>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ObservedUserProfileModal = observer(UserProfileModal);
export default ObservedUserProfileModal;
