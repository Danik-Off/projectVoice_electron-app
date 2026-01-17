import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import './IntegrationsSettings.scss';

interface Integration {
    id: string;
    name: string;
    type: string;
}

interface IntegrationsSettingsProps {
    currentUserPermissions?: string | bigint;
}

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = observer(() => {
    const { t } = useTranslation();
    const [integrations] = useState<Integration[]>([]);

    return (
        <div className="settings-section">
            <div className="section-header">
                <div className="header-content">
                    <h2>{t('serverSettings.integrations') || 'Интеграции'}</h2>
                    <p>
                        {t('serverSettings.integrationsDescription') || 'Управление внешними интеграциями и вебхуками'}
                    </p>
                </div>
            </div>

            <div className="section-content">
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🔗</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.integrations.webhooks') || 'Вебхуки'}</h3>
                                <p>
                                    {t('serverSettings.integrations.webhooksDesc') ||
                                        'Создавайте вебхуки для автоматизации'}
                                </p>
                            </div>
                        </div>
                        <button className="add-button">
                            + {t('serverSettings.integrations.createWebhook') || 'Создать вебхук'}
                        </button>
                    </div>
                    <div className="card-content">
                        {integrations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔗</div>
                                <p>{t('serverSettings.integrations.noWebhooks') || 'Вебхуки не найдены'}</p>
                                <p className="empty-description">
                                    {t('serverSettings.integrations.noWebhooksDesc') ||
                                        'Создайте вебхук для отправки сообщений на внешние сервисы'}
                                </p>
                            </div>
                        ) : (
                            <div className="integrations-list">{/* Список интеграций будет здесь */}</div>
                        )}
                    </div>
                </div>

                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">⚙️</div>
                            <div className="header-text">
                                <h3>{t('serverSettings.integrations.bots') || 'Боты'}</h3>
                                <p>{t('serverSettings.integrations.botsDesc') || 'Управление ботами на сервере'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="empty-state">
                            <div className="empty-icon">🤖</div>
                            <p>{t('serverSettings.integrations.noBots') || 'Боты не найдены'}</p>
                            <p className="empty-description">
                                {t('serverSettings.integrations.noBotsDesc') ||
                                    'Добавьте ботов для расширения функциональности сервера'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="info-box">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-content">
                        <h4>{t('serverSettings.integrations.infoTitle') || 'О интеграциях'}</h4>
                        <p>
                            {t('serverSettings.integrations.infoDesc') ||
                                'Интеграции позволяют подключать внешние сервисы к вашему серверу для автоматизации и расширения функциональности.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default IntegrationsSettings;
