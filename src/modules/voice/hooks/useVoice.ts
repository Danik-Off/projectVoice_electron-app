import { useCallback } from 'react';
import RoomStore from '../store/roomStore';
import { audioSettingsStore as AudioSettingsStore } from '../../../core';

/**
 * Хук для управления голосовыми комнатами
 */
export const useVoice = () => {
    const joinRoom = useCallback((roomId: string, roomName: string) => {
        try {
            RoomStore.connectToRoom(Number(roomId), roomName);
            return { success: true };
        } catch (joinError: unknown) {
            console.error('Error joining voice room:', joinError);
            return { success: false, error: joinError };
        }
    }, []);

    const leaveRoom = useCallback(() => {
        RoomStore.disconnectToRoom();
    }, []);

    const toggleMute = useCallback(() => {
        AudioSettingsStore.toggleMicrophoneMute();
    }, []);

    const toggleDeaf = useCallback(() => {
        AudioSettingsStore.toggleSpeakerMute().catch((toggleError: unknown) => {
            console.error('Error toggling speaker mute:', toggleError);
        });
    }, []);

    return {
        // Room management
        joinRoom,
        leaveRoom,

        // Audio controls
        toggleMute,
        toggleDeaf,

        // State
        isConnected: RoomStore.currentVoiceChannel !== null,
        isMuted: AudioSettingsStore.isMicrophoneMuted,
        isDeafened: AudioSettingsStore.isSpeakerMuted,
        participants: RoomStore.participants,
        currentRoom: RoomStore.currentVoiceChannel
    };
};

/**
 * Хук для управления настройками аудио
 */
export const useAudioSettings = () => {
    const updateVolume = useCallback((volume: number) => {
        AudioSettingsStore.setVolume(volume);
    }, []);

    const updateMicrophone = useCallback((deviceId: string) => {
        AudioSettingsStore.setMicrophone(deviceId).catch((microphoneError: unknown) => {
            console.error('Error setting microphone:', microphoneError);
        });
    }, []);

    const updateSpeaker = useCallback((deviceId: string) => {
        AudioSettingsStore.setSpeaker(deviceId).catch((speakerError: unknown) => {
            console.error('Error setting speaker:', speakerError);
        });
    }, []);

    const toggleEchoCancellation = useCallback(() => {
        AudioSettingsStore.setEchoCancellation(!AudioSettingsStore.echoCancellation).catch((echoError: unknown) => {
            console.error('Error setting echo cancellation:', echoError);
        });
    }, []);

    const toggleNoiseSuppression = useCallback(() => {
        AudioSettingsStore.setNoiseSuppression(!AudioSettingsStore.noiseSuppression).catch((noiseError: unknown) => {
            console.error('Error setting noise suppression:', noiseError);
        });
    }, []);

    const applyAllSettings = useCallback(() => {
        AudioSettingsStore.applyAllSettings().catch((applyError: unknown) => {
            console.error('Error applying settings:', applyError);
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        AudioSettingsStore.resetToDefaults().catch((resetError: unknown) => {
            console.error('Error resetting settings:', resetError);
        });
    }, []);

    return {
        // Volume controls
        updateVolume,
        volume: AudioSettingsStore.volume,

        // Device controls
        updateMicrophone,
        updateSpeaker,
        microphoneDevices: AudioSettingsStore.microphoneDevices,
        speakerDevices: AudioSettingsStore.speakerDevices,
        selectedMicrophone: AudioSettingsStore.selectedMicrophone,
        selectedSpeaker: AudioSettingsStore.selectedSpeaker,

        // Audio processing
        toggleEchoCancellation,
        toggleNoiseSuppression,
        echoCancellation: AudioSettingsStore.echoCancellation,
        noiseSuppression: AudioSettingsStore.noiseSuppression,
        autoGainControl: AudioSettingsStore.autoGainControl,

        // Voice enhancement
        voiceEnhancement: AudioSettingsStore.voiceEnhancement,
        voiceClarity: AudioSettingsStore.voiceClarity,
        backgroundNoiseReduction: AudioSettingsStore.backgroundNoiseReduction,
        voiceBoost: AudioSettingsStore.voiceBoost,

        // Audio effects
        bassBoost: AudioSettingsStore.bassBoost,
        trebleBoost: AudioSettingsStore.trebleBoost,
        stereoEnhancement: AudioSettingsStore.stereoEnhancement,
        spatialAudio: AudioSettingsStore.spatialAudio,

        // Quality settings
        sampleRate: AudioSettingsStore.sampleRate,
        bitrate: AudioSettingsStore.bitrate,
        latency: AudioSettingsStore.latency,
        channelCount: AudioSettingsStore.channelCount,

        // Actions
        applyAllSettings,
        resetToDefaults
    };
};

/**
 * Хук для управления участниками голосовой комнаты
 */
export const useParticipants = () => ({
    participants: RoomStore.participants,
    participantCount: RoomStore.participants.length,
    isParticipant: (userId: string) =>
        RoomStore.participants.some((p) => p.socketId === userId || p.userData?.id === userId)
});
