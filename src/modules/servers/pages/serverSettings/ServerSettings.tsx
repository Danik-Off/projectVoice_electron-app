import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { serverStore } from '../../../../modules/servers';
import { authStore } from '../../../../core';
import { serverMembersService } from '../../../../modules/servers';
import {
    ServerSettingsHeader,
    ServerSettingsNavigation,
    OverviewSettings,
    MembersSettings,
    RolesSettings,
    ChannelsSettings,
    SecuritySettings,
    BansSettings,
    IntegrationsSettings,
    DangerSettings
} from './components';
import type { ServerSettingsTab } from './components';

import './ServerSettings.scss';

const ServerSettings: React.FC = observer(() => {
    const { t } = useTranslation();
    const { serverId } = useParams<{ serverId: string }>();
    const [activeTab, setActiveTab] = useState<ServerSettingsTab>('overview');
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('member');
    const [currentUserPermissions, setCurrentUserPermissions] = useState<string | bigint>(0n);

    const currentUser = authStore.user;
    const server = serverStore.currentServer;

    const loadServerData = useCallback(async () => {
        if (!serverId) return;
        
        setLoading(true);
        try {
            // Загружаем данные сервера только если они еще не загружены или это другой сервер
            if (!serverStore.currentServer || serverStore.currentServer.id !== parseInt(serverId)) {
                await serverStore.fetchServerById(parseInt(serverId));
            }
            
            // Загружаем права текущего пользователя на сервере
            if (currentUser?.id) {
                try {
                    const permissionsData = await serverMembersService.getCurrentMemberPermissions(parseInt(serverId));
                    setCurrentUserPermissions(permissionsData.totalPermissions || '0');
                } catch (error) {
                    console.error('Error loading user permissions:', error);
                    // Fallback: загружаем роль из списка участников
                    const members = await serverMembersService.getServerMembers(parseInt(serverId));
                    const userMember = members.find(member => member.userId === currentUser.id);
                    setCurrentUserRole(userMember?.role || 'member');
                }
            }
        } catch (error) {
            console.error('Error loading server data:', error);
        } finally {
            setLoading(false);
        }
    }, [serverId, currentUser?.id]);

    useEffect(() => {
        loadServerData();
    }, [loadServerData]);

    const renderTabContent = () => {
        const commonProps = { currentUserPermissions };
        
        switch (activeTab) {
            case 'overview':
                return <OverviewSettings {...commonProps} />;
            case 'members':
                return <MembersSettings {...commonProps} />;
            case 'roles':
                return <RolesSettings {...commonProps} />;
            case 'channels':
                return <ChannelsSettings {...commonProps} />;
            case 'security':
                return <SecuritySettings {...commonProps} />;
            case 'bans':
                return <BansSettings {...commonProps} />;
            case 'integrations':
                return <IntegrationsSettings {...commonProps} />;
            case 'danger':
                return <DangerSettings {...commonProps} />;
            default:
                return <OverviewSettings {...commonProps} />;
        }
    };

    if (loading) {
        return (
            <div className="server-settings">
                <div className="loading">
                    <h2>{t('common.loading')}</h2>
                    <p>{t('serverSettings.loadingDescription')}</p>
                </div>
            </div>
        );
    }

    if (!server) {
        return (
            <div className="server-settings">
                <div className="error">
                    <h2>{t('common.error')}</h2>
                    <p>{t('serverSettings.serverNotFound')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="server-settings">
            <ServerSettingsHeader serverName={server.name} />
            
            <div className="settings-container">
                <ServerSettingsNavigation 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab}
                    currentUserRole={currentUserRole}
                    currentUserPermissions={currentUserPermissions}
                />
                
                <div className="settings-main">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
});

export default ServerSettings;