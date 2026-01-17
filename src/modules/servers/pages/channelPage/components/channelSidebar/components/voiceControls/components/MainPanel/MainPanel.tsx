import React from 'react';
import { useTranslation } from 'react-i18next';

import { ClickableAvatar, useUserProfile } from '../../../../../../../../../../components';
import { authStore, audioSettingsStore } from '../../../../../../../../../../core';
import './MainPanel.scss';

interface MainPanelProps {
    currentVoiceChannel: { id: number; name: string };
    participantsCount: number;
    isLocalSpeaking: boolean;
    onMicToggle: () => void;
    onDeafenToggle: () => void;
    onDisconnect: () => void;
    onExpand: () => void;
    onOpenSettings: () => void;
}

const MainPanel: React.FC<MainPanelProps> = ({
    currentVoiceChannel,
    participantsCount,
    isLocalSpeaking,
    onMicToggle,
    onDeafenToggle,
    onDisconnect,
    onExpand,
    onOpenSettings
}) => {
    const { t } = useTranslation();
    const { openProfile } = useUserProfile();
    const currentUser = authStore.user;

    return (
        <div className="voice-controls__main-panel">
            <div className="voice-controls__channel-info">
                <div className="voice-controls__channel-header">
                    <div className="voice-controls__channel-icon">🔊</div>
                    <div className="voice-controls__channel-details">
                        <span className="voice-controls__channel-name">{currentVoiceChannel.name}</span>
                        <span className="voice-controls__participant-count">
                            {participantsCount} {t('voiceControls.participants')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="voice-controls__user-section">
                <div className="voice-controls__user-info">
                    {currentUser != null ? (
                        <ClickableAvatar
                            user={currentUser}
                            size="medium"
                            onClick={() => openProfile(currentUser, true)}
                            className={`voice-controls__avatar ${isLocalSpeaking ? 'voice-controls__avatar--speaking' : ''}`}
                        />
                    ) : null}
                    <div className="voice-controls__user-details">
                        <span className="voice-controls__username">{currentUser?.username ?? 'User'}</span>
                        <span
                            className={`voice-controls__status ${isLocalSpeaking ? 'voice-controls__status--speaking' : ''}`}
                        >
                            {isLocalSpeaking
                                ? 'Говорит'
                                : audioSettingsStore.isMicrophoneMuted
                                  ? 'Микрофон выключен'
                                  : 'Молчит'}
                        </span>
                    </div>
                </div>

                <div className="voice-controls__controls">
                    <button
                        className={`voice-controls__button ${audioSettingsStore.isMicrophoneMuted ? 'voice-controls__button--muted' : ''}`}
                        onClick={onMicToggle}
                        title={
                            audioSettingsStore.isMicrophoneMuted ? t('voiceControls.micOn') : t('voiceControls.micOff')
                        }
                    >
                        {audioSettingsStore.isMicrophoneMuted ? '🔇' : '🎤'}
                    </button>

                    <button
                        className={`voice-controls__button ${audioSettingsStore.isSpeakerMuted ? 'voice-controls__button--deafened' : ''}`}
                        onClick={onDeafenToggle}
                        title={
                            audioSettingsStore.isSpeakerMuted
                                ? t('voiceControls.deafenOff')
                                : t('voiceControls.deafenOn')
                        }
                    >
                        {audioSettingsStore.isSpeakerMuted ? '🔇' : '🔊'}
                    </button>

                    <button
                        className="voice-controls__button voice-controls__button--settings"
                        onClick={onOpenSettings}
                        title="Настройки звука"
                    >
                        ⚙️
                    </button>

                    <button
                        className="voice-controls__button voice-controls__button--expand"
                        onClick={onExpand}
                        title="Развернуть"
                    >
                        ⬇️
                    </button>

                    <button
                        className="voice-controls__button voice-controls__button--disconnect"
                        onClick={onDisconnect}
                        title={t('voiceControls.disconnect')}
                    >
                        📞
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainPanel;
