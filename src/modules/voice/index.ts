/**
 * Voice Module - публичный API
 */
export { voiceModule } from './module';

// Components
export { default as VoiceRoom } from './components/VoiceRoom';
export { default as AudioSettings } from './components/AudioSettings';

// Hooks
export { useVoice, useAudioSettings, useParticipants } from './hooks/useVoice';

// Store
export { default as AudioSettingsStore } from './store/AudioSettingsStore';
export { default as RoomStore } from './store/roomStore';
export { default as ParticipantVolumeStore } from './store/ParticipantVolumeStore';

// Services
export { default as VoiceActivityService } from './services/VoiceActivityService';

// Utils
export { default as WebRTCClient } from './utils/WebRTCClient';
export * from './utils/audioOptimization';
export * from './utils/audioTest';

// Types
export * from './types/WebRTCClient.types';

// Constants
export * from '../../utils/constants/WebRTCClient.constants';
