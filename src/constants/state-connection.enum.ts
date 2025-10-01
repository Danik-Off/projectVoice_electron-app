export const RTCConnectionState = {
    NEW: 'new',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    FAILED: 'failed',
    CLOSED: 'closed'
} as const;

export type RTCConnectionState = typeof RTCConnectionState[keyof typeof RTCConnectionState];

