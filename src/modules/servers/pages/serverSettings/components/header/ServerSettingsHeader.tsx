import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface ServerSettingsHeaderProps {
    serverName: string;
}

const ServerSettingsHeader: React.FC<ServerSettingsHeaderProps> = ({ serverName }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleBackToServer = () => {
        Promise.resolve(navigate(-1)).catch((error: unknown) => {
            console.error('Error navigating back:', error);
        });
    };

    return (
        <div className="settings-header">
            <div className="header-content">
                <button className="back-button" onClick={handleBackToServer}>
                    {t('serverSettings.backToServer')}
                </button>
                <div className="header-text">
                    <h1 className="settings-title">
                        {t('serverSettings.title')}: {serverName}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default ServerSettingsHeader;
