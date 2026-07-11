/* eslint-disable max-lines-per-function -- Complex appearance settings component */
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { themeStore } from '../../../../core';
import './AppearanceSettings.scss';

const AppearanceSettings: React.FC = observer(() => {
    const { t } = useTranslation();
    const [followSystem, setFollowSystem] = useState(false);

    // Проверяем, следует ли тема системным настройкам при загрузке
    useEffect(() => {
        const savedFollowSystem = localStorage.getItem('followSystem') === 'true';
        setFollowSystem(savedFollowSystem);

        if (savedFollowSystem) {
            // Если включено следование системе, применяем системную тему
            themeStore.applySystemTheme();
        }
    }, []);

    const handleSystemThemeToggle = () => {
        const newFollowSystem = !followSystem;
        setFollowSystem(newFollowSystem);
        localStorage.setItem('followSystem', newFollowSystem.toString());

        if (newFollowSystem) {
            // Если включаем следование системе, применяем системную тему
            themeStore.applySystemTheme();
        }
    };

    const handleThemeChange = (theme: 'light' | 'dark') => {
        if (!followSystem) {
            themeStore.setTheme(theme);
        }
    };

    // Слушаем изменения системной темы
    useEffect(() => {
        if (!followSystem) {
            return () => {
                // No cleanup needed when not following system
            };
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (followSystem) {
                themeStore.applySystemTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [followSystem]);

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2>{t('settingsPage.appearance.title')}</h2>
                <p>{t('settingsPage.appearance.description')}</p>
            </div>

            <div className="section-content">
                {/* Основная настройка темы */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🎨</div>
                            <div className="header-text">
                                <h3>{t('settingsPage.appearance.theme.title')}</h3>
                                <p>{t('settingsPage.appearance.theme.description')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Переключатель системной темы */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>{t('settingsPage.appearance.theme.systemTheme')}</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="settings-toggle">
                                    <input type="checkbox" checked={followSystem} onChange={handleSystemThemeToggle} />
                                    <span className="toggle-switch" />
                                    <span className="toggle-label">
                                        {t('settingsPage.appearance.theme.followSystem')}
                                    </span>
                                </div>
                                <div className="setting-description">
                                    {t('settingsPage.appearance.theme.systemDescription')}
                                </div>
                            </div>
                        </div>

                        {/* Селектор темы с превью */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>{t('settingsPage.appearance.theme.manualTheme')}</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="theme-selector">
                                    <div className="theme-options">
                                        <button
                                            className={`theme-option ${themeStore.currentTheme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('light')}
                                            disabled={followSystem}
                                        >
                                            <div className="theme-preview light-preview">
                                                <div className="preview-header" />
                                                <div className="preview-sidebar" />
                                                <div className="preview-content" />
                                            </div>
                                            <span className="theme-name">
                                                ☀️ {t('settingsPage.appearance.theme.light')}
                                            </span>
                                        </button>

                                        <button
                                            className={`theme-option ${themeStore.currentTheme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('dark')}
                                            disabled={followSystem}
                                        >
                                            <div className="theme-preview dark-preview">
                                                <div className="preview-header" />
                                                <div className="preview-sidebar" />
                                                <div className="preview-content" />
                                            </div>
                                            <span className="theme-name">
                                                🌙 {t('settingsPage.appearance.theme.dark')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Информация о текущей теме */}
                        <div className="theme-info">
                            <div className="info-item">
                                <span className="info-label">{t('settingsPage.appearance.theme.currentTheme')}:</span>
                                <span className="info-value">
                                    {themeStore.currentTheme === 'dark'
                                        ? `🌙 ${t('settingsPage.appearance.theme.dark')}`
                                        : `☀️ ${t('settingsPage.appearance.theme.light')}`}
                                </span>
                            </div>
                            {followSystem ? (
                                <div className="info-item">
                                    <span className="info-badge">🔄 {t('settingsPage.appearance.theme.autoSync')}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AppearanceSettings;
