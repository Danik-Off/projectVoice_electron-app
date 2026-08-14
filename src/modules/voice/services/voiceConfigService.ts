import { apiClient } from '../../../core';

interface IceServersResponse {
    iceServers: RTCIceServer[];
}

class VoiceConfigService {
    /** Получить STUN/TURN конфигурацию для WebRTC (GET /voice/ice-servers) */
    async getIceServers(): Promise<RTCIceServer[]> {
        const data = await apiClient<IceServersResponse>('/voice/ice-servers', { method: 'GET' });
        return data.iceServers;
    }
}

export const voiceConfigService = new VoiceConfigService();
