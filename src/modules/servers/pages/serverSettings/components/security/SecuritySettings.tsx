import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { serverStore } from '../../../../../../modules/servers';
import { notificationStore } from '../../../../../../core';
import { serverService } from '../../../../../../modules/servers';
import './SecuritySettings.scss';

const SecuritySettings: React.FC = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [loading, setLoading] = useState(false);
    
    const server = serverStore.currentServer;
    const [settings, setSettings] = useState({
        verificationLevel: server?.verificationLevel || 0,
        explicitContentFilter: server?.explicitContentFilter || 0,
        defaultNotifications: server?.defaultNotifications || 'all',
        require2FA: server?.require2FA || false,
    });

    const verificationLevels = [
        { value: 0, label: t('serverSettings.security.verificationNone') || 'Нет', description: t('serverSettings.security.verificationNoneDesc') || 'Нет требований' },
        { value: 1, label: t('serverSettings.security.verificationLow') || 'Низкий', description: t('serverSettings.security.verificationLowDesc') || 'Требуется подтвержденный email' },
        { value: 2, label: t('serverSettings.security.verificationMedium') || 'Средний', description: t('serverSettings.security.verificationMediumDesc') || 'Участник должен быть на сервере более 5 минут' },
        { value: 3, label: t('serverSettings.security.verificationHigh') || 'Высокий', description: t('serverSettings.security.verificationHighDesc') || 'Участник должен быть на сервере более 10 минут' },
        { value: 4, label: t('serverSettings.security.verificationVeryHigh') || 'Очень высокий', description: t('serverSettings.security.verificationVeryHighDesc') || 'Требуется номер телефона' },
    ];

    const explicitContentFilters = [
        { value: 0, label: t('serverSettings.security.filterDisabled') || 'Отключен', description: t('serverSettings.security.filterDisabledDesc') || 'Не сканировать содержимое' },
        { value: 1, label: t('serverSettings.security.filterMembers') || 'Участники без ролей', description: t('serverSettings.security.filterMembersDesc') || 'Сканировать только у участников без ролей' },
        { value: 2, label: t('serverSettings.security.filterAll') || 'Все участники', description: t('serverSettings.security.filterAllDesc') || 'Сканировать у всех участников' },
    ];

    const handleSave = async () => {
        if (!serverId) return;
        
        setLoading(true);
        try {
            await serverService.update(parseInt(serverId), settings);
            notificationStore.addNotification(
                t('serverSettings.security.settingsSaved') || 'Настройки безопасности сохранены',
                'success'
            );
        } catch (error) {
            console.error('Error saving security settings:', error);
            notificationStore.addNotification(
                t('serverSettings.security.saveError') || 'Ошибка сохранения настроек',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <div className="header-content">
                    <h2>{t('serverSettings.security') || 'Безопасность'}</h2>
                    <p>{t('serverSettings.securityDescription') || 'Настройки безопасности и приватности сервера'}</p>
                </div>
            </div>

            <div className="section-content">
                {/* Уровень верификации */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🔐</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.security.verificationLevel') || 'Уровень верификации'}</h3>
                                <p>{t('serverSettings.security.verificationLevelDesc') || 'Определяет требования для участников'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="radio-group">
                            {verificationLevels.map((level) => (
                                <label key={level.value} className="radio-option">
                                    <input
                                        type="radio"
                                        name="verificationLevel"
                                        value={level.value}
                                        checked={settings.verificationLevel === level.value}
                                        onChange={(e) => setSettings(prev => ({ ...prev, verificationLevel: parseInt(e.target.value) }))}
                                    />
                                    <div className="option-content">
                                        <span className="option-label">{level.label}</span>
                                        <span className="option-description">{level.description}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Фильтр контента */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🛡️</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.security.explicitContentFilter') || 'Фильтр явного контента'}</h3>
                                <p>{t('serverSettings.security.explicitContentFilterDesc') || 'Автоматическое удаление неприемлемого контента'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="radio-group">
                            {explicitContentFilters.map((filter) => (
                                <label key={filter.value} className="radio-option">
                                    <input
                                        type="radio"
                                        name="explicitContentFilter"
                                        value={filter.value}
                                        checked={settings.explicitContentFilter === filter.value}
                                        onChange={(e) => setSettings(prev => ({ ...prev, explicitContentFilter: parseInt(e.target.value) }))}
                                    />
                                    <div className="option-content">
                                        <span className="option-label">{filter.label}</span>
                                        <span className="option-description">{filter.description}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Уведомления по умолчанию */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🔔</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.security.defaultNotifications') || 'Уведомления по умолчанию'}</h3>
                                <p>{t('serverSettings.security.defaultNotificationsDesc') || 'Настройки уведомлений для новых участников'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <select
                            className="settings-select"
                            value={settings.defaultNotifications}
                            onChange={(e) => setSettings(prev => ({ ...prev, defaultNotifications: e.target.value }))}
                        >
                            <option value="all">{t('serverSettings.security.notifyAll') || 'Все сообщения'}</option>
                            <option value="mentions">{t('serverSettings.security.notifyMentions') || 'Только упоминания'}</option>
                            <option value="none">{t('serverSettings.security.notifyNone') || 'Ничего'}</option>
                        </select>
                    </div>
                </div>

                {/* Требование 2FA */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🔑</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.security.require2FA') || 'Требовать двухфакторную аутентификацию'}</h3>
                                <p>{t('serverSettings.security.require2FADesc') || 'Только участники с включенной 2FA смогут выполнять определенные действия'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.require2FA}
                                onChange={(e) => setSettings(prev => ({ ...prev, require2FA: e.target.checked }))}
                            />
                            <span className="toggle-slider"></span>
                            <span className="toggle-label">
                                {settings.require2FA 
                                    ? (t('serverSettings.security.require2FAEnabled') || 'Включено')
                                    : (t('serverSettings.security.require2FADisabled') || 'Выключено')
                                }
                            </span>
                        </label>
                    </div>
                </div>

                {/* Кнопка сохранения */}
                <div className="settings-actions">
                    <button 
                        className="save-button"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading 
                            ? (t('common.saving') || 'Сохранение...')
                            : (t('common.save') || 'Сохранить изменения')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
});

export default SecuritySettings;

