import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverStore } from '../../../../../../modules/servers';
import { serverMembersService } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import './OverviewSettings.scss';

interface OverviewSettingsProps {
    currentUserPermissions?: string | bigint;
}

const OverviewSettings: React.FC<OverviewSettingsProps> = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        membersCount: 0,
        channelsCount: 0,
        rolesCount: 0
    });
    const [editForm, setEditForm] = useState({
        name: serverStore.currentServer?.name || '',
        description: serverStore.currentServer?.description || ''
    });

    const server = serverStore.currentServer;

    useEffect(() => {
        if (server) {
            setEditForm({
                name: server.name || '',
                description: server.description || ''
            });
        }
    }, [server]);

    useEffect(() => {
        const loadStats = async () => {
            if (!serverId) {
                return;
            }
            try {
                // Загружаем участников
                const members = await serverMembersService.getServerMembers(parseInt(serverId));

                // Загружаем роли
                const { roleService } = await import('../../../../services/roleService');
                let rolesCount = 0;
                try {
                    const roles = await roleService.getRoles(parseInt(serverId));
                    rolesCount = roles.length;
                } catch (error) {
                    console.error('Error loading roles:', error);
                }

                // Загружаем каналы
                let channelsCount = 0;
                try {
                    const { channelsStore } = await import('../../../../../../modules/channels');
                    const channels = channelsStore.channels.filter(
                        (ch: { serverId: number }) => ch.serverId === parseInt(serverId)
                    );
                    channelsCount = channels.length;
                } catch (error) {
                    console.error('Error loading channels:', error);
                }

                setStats({
                    membersCount: members.length,
                    channelsCount,
                    rolesCount
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };
        loadStats();
    }, [serverId]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({
            name: server?.name || '',
            description: server?.description || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            name: server?.name || '',
            description: server?.description || ''
        });
    };

    const handleSave = async () => {
        if (!serverId || !server) {
            return;
        }

        if (!editForm.name.trim()) {
            notificationStore.addNotification(
                t('serverSettings.serverNameRequired') || 'Название сервера обязательно',
                'error'
            );
            return;
        }

        setLoading(true);
        try {
            await serverStore.updateServer(parseInt(serverId), {
                name: editForm.name.trim(),
                description: editForm.description.trim() || undefined
            });
            setIsEditing(false);
            notificationStore.addNotification(
                t('serverSettings.serverUpdated') || 'Настройки сервера обновлены',
                'success'
            );
        } catch (error) {
            console.error('Error saving server settings:', error);
            notificationStore.addNotification(
                t('serverSettings.serverUpdateError') || 'Ошибка обновления настроек сервера',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <div className="header-content">
                    <h2>{t('serverSettings.overview') || 'Общая информация'}</h2>
                    <p>{t('serverSettings.overviewDescription') || 'Основная информация и статистика сервера'}</p>
                </div>
            </div>

            <div className="section-content">
                {/* Статистика сервера */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.membersCount}</div>
                            <div className="stat-label">{t('serverSettings.members') || 'Участников'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.channelsCount}</div>
                            <div className="stat-label">{t('serverSettings.channels') || 'Каналов'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎭</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.rolesCount}</div>
                            <div className="stat-label">{t('serverSettings.roles') || 'Ролей'}</div>
                        </div>
                    </div>
                </div>

                {/* Информация о сервере */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">📊</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.serverInfo')}</h3>
                                <p>{t('serverSettings.serverInfoDescription')}</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <div className="header-actions">
                                <button className="edit-button" onClick={handleEdit}>
                                    {t('common.edit')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        {!isEditing ? (
                            <div className="server-info">
                                <div className="info-item">
                                    <label className="info-label">{t('serverSettings.serverName')}</label>
                                    <span className="info-value">{server?.name}</span>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">{t('serverSettings.serverDescription')}</label>
                                    <span className="info-value">
                                        {server?.description || t('serverSettings.noDescription')}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">{t('serverSettings.serverId')}</label>
                                    <span className="info-value">{server?.id}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="edit-form">
                                <div className="setting-group">
                                    <div className="setting-header">
                                        <label className="setting-label">
                                            {t('serverSettings.serverName')} <span className="required">*</span>
                                        </label>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder={t('serverSettings.serverNamePlaceholder')}
                                            className="setting-input"
                                        />
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <div className="setting-header">
                                        <label className="setting-label">{t('serverSettings.serverDescription')}</label>
                                    </div>
                                    <div className="setting-control">
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder={t('serverSettings.serverDescriptionPlaceholder')}
                                            className="setting-textarea"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="cancel-button" onClick={handleCancel} disabled={loading}>
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        className="save-button"
                                        onClick={handleSave}
                                        disabled={loading || !editForm.name.trim()}
                                    >
                                        {loading
                                            ? t('common.saving') || 'Сохранение...'
                                            : t('common.save') || 'Сохранить'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default OverviewSettings;
