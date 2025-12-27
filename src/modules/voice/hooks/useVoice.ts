import { useCallback } from 'react';
import RoomStore from '../store/roomStore';
import AudioSettingsStore from '../store/AudioSettingsStore';

/**
 * Хук для управления голосовыми комнатами
 */
export const useVoice = () => {
  const joinRoom = useCallback(async (roomId: string, roomName: string) => {
    try {
      await RoomStore.connectToRoom(Number(roomId), roomName);
      return { success: true };
    } catch (error) {
      console.error('Error joining voice room:', error);
      return { success: false, error };
    }
  }, []);

  const leaveRoom = useCallback(() => {
    RoomStore.disconnectToRoom();
  }, []);

  const toggleMute = useCallback(() => {
    AudioSettingsStore.toggleMicrophoneMute();
  }, []);

  const toggleDeaf = useCallback(() => {
    AudioSettingsStore.toggleSpeakerMute();
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
    currentRoom: RoomStore.currentVoiceChannel,
  };
};

/**
 * Хук для управления настройками аудио
 */
export const useAudioSettings = () => {
  const updateVolume = useCallback((volume: number) => {
    AudioSettingsStore.setVolume(volume);
  }, []);

  const updateMicrophone = useCallback(async (deviceId: string) => {
    await AudioSettingsStore.setMicrophone(deviceId);
  }, []);

  const updateSpeaker = useCallback((deviceId: string) => {
    AudioSettingsStore.setSpeaker(deviceId);
  }, []);

  const toggleEchoCancellation = useCallback(() => {
    AudioSettingsStore.setEchoCancellation(!AudioSettingsStore.echoCancellation);
  }, []);

  const toggleNoiseSuppression = useCallback(() => {
    AudioSettingsStore.setNoiseSuppression(!AudioSettingsStore.noiseSuppression);
  }, []);

  const applyAllSettings = useCallback(() => {
    AudioSettingsStore.applyAllSettings();
  }, []);

  const resetToDefaults = useCallback(() => {
    AudioSettingsStore.resetToDefaults();
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
    resetToDefaults,
  };
};

/**
 * Хук для управления участниками голосовой комнаты
 */
export const useParticipants = () => {
  return {
    participants: RoomStore.participants,
    participantCount: RoomStore.participants.length,
    isParticipant: (userId: string) => 
      RoomStore.participants.some((p) => p.socketId === userId || p.userData?.id === userId),
  };
};
