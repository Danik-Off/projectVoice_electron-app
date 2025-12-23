/**
 * Voice Module - публичный API
 */
export { voiceModule } from './module';

// Re-export from features/voice
export { default as VoiceRoom } from '../../features/voice/components/VoiceRoom';
export { default as AudioSettings } from '../../features/voice/components/AudioSettings';
export { useVoice, useAudioSettings, useParticipants } from '../../features/voice/hooks/useVoice';
export { default as AudioSettingsStore } from '../../features/voice/store/AudioSettingsStore';
export { default as RoomStore } from '../../features/voice/store/roomStore';
export { default as ParticipantVolumeStore } from '../../features/voice/store/ParticipantVolumeStore';
export { default as VoiceActivityService } from '../../features/voice/services/VoiceActivityService';
export { default as WebRTCClient } from '../../features/voice/utils/WebRTCClient';
export * from '../../features/voice/utils/audioOptimization';
export * from '../../features/voice/utils/audioTest';
export * from '../../features/voice/types/WebRTCClient.types';
export * from '../../features/voice/utils/constants/WebRTCClient.constants';

