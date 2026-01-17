import React from 'react';
import { useTranslation } from 'react-i18next';
import './ServerSettingsNavigation.scss';

export type ServerSettingsTab =
    | 'overview'
    | 'members'
    | 'roles'
    | 'channels'
    | 'security'
    | 'bans'
    | 'integrations'
    | 'danger';

interface TabItem {
    id: ServerSettingsTab;
    label: string;
    icon: string;
    description?: string;
    requiredRole?: 'owner' | 'admin';
    category?: 'main' | 'advanced' | 'danger';
}

interface ServerSettingsNavigationProps {
    activeTab: ServerSettingsTab;
    onTabChange: (tab: ServerSettingsTab) => void;
    currentUserRole: string;
    currentUserPermissions?: string | bigint;
}

/* eslint-disable max-lines-per-function -- Complex navigation component with many tabs */
/* eslint-disable complexity -- Complex navigation logic with role-based access */
const ServerSettingsNavigation: React.FC<ServerSettingsNavigationProps> = ({
    activeTab,
    onTabChange,
    currentUserRole
}) => {
    const { t } = useTranslation();

    const tabs: TabItem[] = [
        // Основные настройки
        {
            id: 'overview',
            label: t('serverSettings.overview') || 'Общая информация',
            icon: '📊',
            description: t('serverSettings.overviewDescription') || 'Основная информация о сервере',
            category: 'main'
        },
        {
            id: 'members',
            label: t('serverSettings.members') || 'Участники',
            icon: '👥',
            description: t('serverSettings.membersDescription') || 'Управление участниками сервера',
            category: 'main'
        },
        {
            id: 'roles',
            label: t('serverSettings.roles') || 'Роли',
            icon: '🎭',
            description: t('serverSettings.rolesDescription') || 'Управление ролями и разрешениями',
            category: 'main',
            requiredRole: 'admin'
        },
        {
            id: 'channels',
            label: t('serverSettings.channels') || 'Каналы',
            icon: '📝',
            description: t('serverSettings.channelsDescription') || 'Управление каналами сервера',
            category: 'main',
            requiredRole: 'admin'
        },

        // Дополнительные настройки
        {
            id: 'security',
            label: t('serverSettings.security') || 'Безопасность',
            icon: '🔒',
            description: t('serverSettings.securityDescription') || 'Настройки безопасности и приватности',
            category: 'advanced',
            requiredRole: 'admin'
        },
        {
            id: 'bans',
            label: t('serverSettings.bans') || 'Бан-лист',
            icon: '🚫',
            description: t('serverSettings.bansDescription') || 'Управление забаненными пользователями',
            category: 'advanced',
            requiredRole: 'admin'
        },
        {
            id: 'integrations',
            label: t('serverSettings.integrations') || 'Интеграции',
            icon: '🔗',
            description: t('serverSettings.integrationsDescription') || 'Внешние интеграции и вебхуки',
            category: 'advanced',
            requiredRole: 'admin'
        },

        // Опасная зона
        {
            id: 'danger',
            label: t('serverSettings.dangerZone') || 'Опасная зона',
            icon: '⚠️',
            description: t('serverSettings.dangerDescription') || 'Необратимые действия',
            category: 'danger',
            requiredRole: 'owner'
        }
    ];

    const canAccessTab = (tab: TabItem): boolean => {
        if (!tab.requiredRole) {
            return true;
        }
        if (tab.requiredRole === 'owner') {
            return currentUserRole === 'owner';
        }
        if (tab.requiredRole === 'admin') {
            return currentUserRole === 'owner' || currentUserRole === 'admin';
        }
        return false;
    };

    const filteredTabs = tabs.filter(canAccessTab);

    const mainTabs = filteredTabs.filter((tab) => tab.category === 'main');
    const advancedTabs = filteredTabs.filter((tab) => tab.category === 'advanced');
    const dangerTabs = filteredTabs.filter((tab) => tab.category === 'danger');

    const renderTabGroup = (tabItems: TabItem[], groupLabel?: string) => {
        if (tabItems.length === 0) {
            return null;
        }

        return (
            <div className="nav-group">
                {groupLabel != null && groupLabel.length > 0 ? <div className="group-label">{groupLabel}</div> : null}
                {tabItems.map((tab) => (
                    <div
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        title={tab.description ?? ''}
                    >
                        <div className="tab-content">
                            <span className="tab-icon">{tab.icon}</span>
                            <div className="tab-text">
                                <span className="tab-label">{tab.label}</span>
                                {tab.description != null && tab.description.length > 0 ? (
                                    <span className="tab-description">{tab.description}</span>
                                ) : null}
                            </div>
                        </div>
                        {activeTab === tab.id && <div className="active-indicator" />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="settings-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">{t('serverSettings.title') || 'Настройки сервера'}</h2>
            </div>
            <nav className="settings-nav">
                {renderTabGroup(mainTabs, t('serverSettings.mainSettings') || 'Основные')}
                {renderTabGroup(advancedTabs, t('serverSettings.advancedSettings') || 'Дополнительно')}
                {renderTabGroup(dangerTabs)}
            </nav>
        </div>
    );
};

export default ServerSettingsNavigation;
