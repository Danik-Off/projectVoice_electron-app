export const iceServers = [
    // Google STUN серверы (основные)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },

    // Mozilla STUN серверы
    { urls: 'stun:stun.services.mozilla.com' },

    // Дополнительные STUN серверы для лучшего соединения
    { urls: 'stun:stun.anyfirewall.com:3478' },
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.sipgate.net' },
    { urls: 'stun:stun.counterpath.com' },
    { urls: 'stun:stun.voipbuster.com' },
    { urls: 'stun:stun.voipstunt.com' },

    // Дополнительные надежные STUN серверы
    { urls: 'stun:stun.1und1.de' },
    { urls: 'stun:stun.gmx.net' },
    { urls: 'stun:stun.qq.com' },
    { urls: 'stun:stun.miwifi.com' },
    { urls: 'stun:stun.nextcloud.com' }

    // TURN серверы для NAT traversal (если доступны)
    // Примечание: Для продакшена рекомендуется использовать собственные TURN серверы
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
];
