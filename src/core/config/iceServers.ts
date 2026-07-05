/**
 * ICE Servers configuration for WebRTC
 *
 * STUN-серверов достаточно 2-3 - все они лишь сообщают публичный IP клиента,
 * добавление лишних серверов не улучшает соединение, а только замедляет сбор
 * ICE-кандидатов (каждый добавляет round-trip перед тем, как offer готов).
 */
export const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' }

    // TODO: TURN-сервер для NAT traversal - без него звонки не устанавливаются
    // у части пользователей за строгим/симметричным NAT или корпоративным файрволом,
    // т.к. соединение "точка-точка" в таких сетях невозможно и нужен relay.
    // Добавить сюда при появлении своего coturn или провайдера (Twilio/Metered/Cloudflare):
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
];
