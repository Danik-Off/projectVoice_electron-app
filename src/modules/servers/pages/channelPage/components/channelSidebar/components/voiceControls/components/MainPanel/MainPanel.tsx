import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUserProfile, ClickableAvatar } from '../../../../../../../../../../shared';
import { authStore, audioSettingsStore } from '../../../../../../../../../../core';
import MicIcon from '../../../../../../../../../../icons/Micro';
import HeadphonesIcon from '../../../../../../../../../../icons/HeadphonesIcon';
import SettingsIcon from '../../../../../../../../../../icons/SettingsIcon';
import ChevronIcon from '../../../../../../../../../../icons/ChevronIcon';
import PhoneOffIcon from '../../../../../../../../../../icons/PhoneOffIcon';
import './MainPanel.scss';

interface MainPanelProps {
    currentVoiceChannel: { id: number; name: string } | null;
    participantsCount: number;
    isLocalSpeaking: boolean;
    onMicToggle: () => void;
    onDeafenToggle: () => void;
    onDisconnect: () => void;
    onExpand: () => void;
    onOpenSettings: () => void;
}

const getStatusText = (t: (key: string) => string, isLocalSpeaking: boolean, isConnected: boolean): string => {
    if (isLocalSpeaking) {
        return t('voiceControls.speaking');
    }
    if (audioSettingsStore.isMicrophoneMuted) {
        return t('voiceControls.micOffStatus');
    }
    return isConnected ? t('voiceControls.silent') : t('voiceControls.notConnected');
};

const ChannelInfo: React.FC<{ channelName: string; participantsCount: number }> = ({
    channelName,
    participantsCount
}) => {
    const { t } = useTranslation();

    return (
        <div className="voice-controls__channel-info">
            <div className="voice-controls__channel-header">
                <div className="voice-controls__channel-icon">
                    <HeadphonesIcon isDeafened={false} />
                </div>
                <div className="voice-controls__channel-details">
                    <span className="voice-controls__channel-name">{channelName}</span>
                    <span className="voice-controls__participant-count">
                        {participantsCount} {t('voiceControls.participants')}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface VoiceControlButtonsProps {
    isConnected: boolean;
    onMicToggle: () => void;
    onDeafenToggle: () => void;
    onDisconnect: () => void;
    onExpand: () => void;
    onOpenSettings: () => void;
}

const VoiceControlButtons: React.FC<VoiceControlButtonsProps> = ({
    isConnected,
    onMicToggle,
    onDeafenToggle,
    onDisconnect,
    onExpand,
    onOpenSettings
}) => {
    const { t } = useTranslation();

    return (
        <div className="voice-controls__controls">
            <button
                type="button"
                className={`voice-controls__button ${audioSettingsStore.isMicrophoneMuted ? 'voice-controls__button--muted' : ''}`}
                onClick={onMicToggle}
                title={audioSettingsStore.isMicrophoneMuted ? t('voiceControls.micOn') : t('voiceControls.micOff')}
            >
                <MicIcon isMuted={audioSettingsStore.isMicrophoneMuted} />
            </button>

            <button
                type="button"
                className={`voice-controls__button ${audioSettingsStore.isSpeakerMuted ? 'voice-controls__button--deafened' : ''}`}
                onClick={onDeafenToggle}
                title={audioSettingsStore.isSpeakerMuted ? t('voiceControls.deafenOff') : t('voiceControls.deafenOn')}
            >
                <HeadphonesIcon isDeafened={audioSettingsStore.isSpeakerMuted} />
            </button>

            <button
                type="button"
                className="voice-controls__button voice-controls__button--settings"
                onClick={onOpenSettings}
                title="Настройки звука"
            >
                <SettingsIcon />
            </button>

            {isConnected ? (
                <button
                    type="button"
                    className="voice-controls__button voice-controls__button--expand"
                    onClick={onExpand}
                    title="Развернуть"
                >
                    <ChevronIcon direction="down" />
                </button>
            ) : null}

            {isConnected ? (
                <button
                    type="button"
                    className="voice-controls__button voice-controls__button--disconnect"
                    onClick={onDisconnect}
                    title={t('voiceControls.disconnect')}
                >
                    <PhoneOffIcon />
                </button>
            ) : null}
        </div>
    );
};

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
    const isConnected = currentVoiceChannel != null;

    return (
        <div className="voice-controls__main-panel">
            {isConnected ? (
                <ChannelInfo channelName={currentVoiceChannel.name} participantsCount={participantsCount} />
            ) : null}

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
                            {getStatusText(t, isLocalSpeaking, isConnected)}
                        </span>
                    </div>
                </div>

                <VoiceControlButtons
                    isConnected={isConnected}
                    onMicToggle={onMicToggle}
                    onDeafenToggle={onDeafenToggle}
                    onDisconnect={onDisconnect}
                    onExpand={onExpand}
                    onOpenSettings={onOpenSettings}
                />
            </div>
        </div>
    );
};

export default MainPanel;
