/**
 * Voice Module - публичный API
 */
export { voiceModule } from './module';

// Store - AudioSettingsStore теперь в core, реэкспортируем для обратной совместимости
export { audioSettingsStore as AudioSettingsStore } from '../../core';
export { default as RoomStore } from './store/roomStore';
export { default as ParticipantVolumeStore } from './store/ParticipantVolumeStore';

// Services
export { default as VoiceActivityService } from './services/VoiceActivityService';
export { voiceConfigService } from './services/voiceConfigService';

// Utils
export { default as WebRTCClient } from './utils/WebRTCClient';

// Types
export * from './types/WebRTCClient.types';
export type { Participant, UserData } from './types/roomStore.types';
