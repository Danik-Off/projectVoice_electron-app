import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { notificationStore, audioSettingsStore } from '../../../../../../../../../core';
import voiceRoomStore from '../../../../../../../../voice/store/roomStore';

export const useVoiceControls = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { serverId } = useParams<{ serverId: string }>();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [showAudioSettingsModal, setShowAudioSettingsModal] = useState<boolean>(false);

    // Вспомогательная функция для безопасной обработки ошибок
    const handleError = (error: unknown, context: string): void => {
        const errorMessage =
            error instanceof Error ? error.message : typeof error === 'string' ? error : 'Произошла неизвестная ошибка';
        try {
            notificationStore.addNotification(`${context}: ${errorMessage}`, 'error', 5000);
        } catch {
            // Игнорируем ошибки при показе уведомления
        }
    };

    const handleMicToggle = (): void => {
        audioSettingsStore.toggleMicrophoneMute();
        notificationStore.addNotification(
            audioSettingsStore.isMicrophoneMuted ? t('voiceControls.micOff') : t('voiceControls.micOn'),
            'info'
        );
    };

    const handleDeafenToggle = (): void => {
        audioSettingsStore.toggleSpeakerMute().catch((error: unknown) => {
            handleError(error, 'Error toggling speaker mute');
        });
        notificationStore.addNotification(
            audioSettingsStore.isSpeakerMuted ? t('voiceControls.deafenOn') : t('voiceControls.deafenOff'),
            'info'
        );
    };

    const handleDisconnect = (): void => {
        voiceRoomStore.disconnectToRoom();
        notificationStore.addNotification(t('voiceControls.disconnect'), 'info');

        // Переходим на страницу сервера без голосовой комнаты
        if (serverId != null && serverId.length > 0) {
            Promise.resolve(navigate(`/server/${serverId}`)).catch((error: unknown) => {
                handleError(error, 'Error navigating');
            });
        }
    };

    const handleExpand = (): void => {
        setIsExpanded(!isExpanded);
    };

    const handleParticipantVolumeChange = (socketId: string, volume: number): void => {
        // Обновляем громкость через WebRTCClient
        voiceRoomStore.webRTCClient?.setParticipantVolume(socketId, volume);
    };

    return {
        isExpanded,
        showAudioSettingsModal,
        setIsExpanded,
        setShowAudioSettingsModal,
        handleMicToggle,
        handleDeafenToggle,
        handleDisconnect,
        handleExpand,
        handleParticipantVolumeChange,
        handleError
    };
};
