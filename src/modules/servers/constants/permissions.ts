/**
 * Константы разрешений (Bitmask) - соответствуют бэкенду
 * Используется BigInt для работы с большими числами
 */
export const Permissions = {
    CREATE_INSTANT_INVITE: 1n << 0n,
    KICK_MEMBERS: 1n << 1n,
    BAN_MEMBERS: 1n << 2n,
    ADMINISTRATOR: 1n << 3n,
    MANAGE_CHANNELS: 1n << 4n,
    MANAGE_GUILD: 1n << 5n,
    ADD_REACTIONS: 1n << 6n,
    VIEW_AUDIT_LOG: 1n << 7n,
    PRIORITY_SPEAKER: 1n << 8n,
    STREAM: 1n << 9n,
    VIEW_CHANNEL: 1n << 10n,
    SEND_MESSAGES: 1n << 11n,
    SEND_TTS_MESSAGES: 1n << 12n,
    MANAGE_MESSAGES: 1n << 13n,
    EMBED_LINKS: 1n << 14n,
    ATTACH_FILES: 1n << 15n,
    READ_MESSAGE_HISTORY: 1n << 16n,
    MENTION_EVERYONE: 1n << 17n,
    USE_EXTERNAL_EMOJIS: 1n << 18n,
    VIEW_GUILD_INSIGHTS: 1n << 19n,
    CONNECT: 1n << 20n,
    SPEAK: 1n << 21n,
    MUTE_MEMBERS: 1n << 22n,
    DEAFEN_MEMBERS: 1n << 23n,
    MOVE_MEMBERS: 1n << 24n,
    USE_VAD: 1n << 25n,
    CHANGE_NICKNAME: 1n << 26n,
    MANAGE_NICKNAMES: 1n << 27n,
    MANAGE_ROLES: 1n << 28n,
    MANAGE_WEBHOOKS: 1n << 29n,
    MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
    USE_APPLICATION_COMMANDS: 1n << 31n,
    REQUEST_TO_SPEAK: 1n << 32n,
    MANAGE_EVENTS: 1n << 33n,
    MANAGE_THREADS: 1n << 34n,
    CREATE_PUBLIC_THREADS: 1n << 35n,
    CREATE_PRIVATE_THREADS: 1n << 36n,
    USE_EXTERNAL_STICKERS: 1n << 37n,
    SEND_MESSAGES_IN_THREADS: 1n << 38n,
    USE_EMBEDDED_ACTIVITIES: 1n << 39n,
    MODERATE_MEMBERS: 1n << 40n
} as const;

/**
 * Названия разрешений для отображения
 */
export const PermissionNames: Record<keyof typeof Permissions, string> = {
    CREATE_INSTANT_INVITE: 'Создавать приглашения',
    KICK_MEMBERS: 'Исключать участников',
    BAN_MEMBERS: 'Банить участников',
    ADMINISTRATOR: 'Администратор',
    MANAGE_CHANNELS: 'Управлять каналами',
    MANAGE_GUILD: 'Управлять сервером',
    ADD_REACTIONS: 'Добавлять реакции',
    VIEW_AUDIT_LOG: 'Просматривать журнал аудита',
    PRIORITY_SPEAKER: 'Приоритетный спикер',
    STREAM: 'Транслировать',
    VIEW_CHANNEL: 'Просматривать канал',
    SEND_MESSAGES: 'Отправлять сообщения',
    SEND_TTS_MESSAGES: 'Отправлять TTS сообщения',
    MANAGE_MESSAGES: 'Управлять сообщениями',
    EMBED_LINKS: 'Встраивать ссылки',
    ATTACH_FILES: 'Прикреплять файлы',
    READ_MESSAGE_HISTORY: 'Читать историю сообщений',
    MENTION_EVERYONE: 'Упоминать всех',
    USE_EXTERNAL_EMOJIS: 'Использовать внешние эмодзи',
    VIEW_GUILD_INSIGHTS: 'Просматривать аналитику сервера',
    CONNECT: 'Подключаться к голосовому каналу',
    SPEAK: 'Говорить в голосовом канале',
    MUTE_MEMBERS: 'Отключать микрофон участников',
    DEAFEN_MEMBERS: 'Отключать звук участников',
    MOVE_MEMBERS: 'Перемещать участников',
    USE_VAD: 'Использовать активацию по голосу',
    CHANGE_NICKNAME: 'Изменять свой никнейм',
    MANAGE_NICKNAMES: 'Управлять никнеймами',
    MANAGE_ROLES: 'Управлять ролями',
    MANAGE_WEBHOOKS: 'Управлять вебхуками',
    MANAGE_EMOJIS_AND_STICKERS: 'Управлять эмодзи и стикерами',
    USE_APPLICATION_COMMANDS: 'Использовать команды приложения',
    REQUEST_TO_SPEAK: 'Запрашивать слово',
    MANAGE_EVENTS: 'Управлять событиями',
    MANAGE_THREADS: 'Управлять ветками',
    CREATE_PUBLIC_THREADS: 'Создавать публичные ветки',
    CREATE_PRIVATE_THREADS: 'Создавать приватные ветки',
    USE_EXTERNAL_STICKERS: 'Использовать внешние стикеры',
    SEND_MESSAGES_IN_THREADS: 'Отправлять сообщения в ветках',
    USE_EMBEDDED_ACTIVITIES: 'Использовать встроенные активности',
    MODERATE_MEMBERS: 'Модерировать участников'
};

/**
 * Группы разрешений для удобной организации в UI
 */
export const PermissionGroups = {
    GENERAL: [
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'ADD_REACTIONS',
        'USE_EXTERNAL_EMOJIS'
    ] as const,
    MEMBER: ['KICK_MEMBERS', 'BAN_MEMBERS', 'MODERATE_MEMBERS', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES'] as const,
    CHANNEL: [
        'MANAGE_CHANNELS',
        'MANAGE_THREADS',
        'CREATE_PUBLIC_THREADS',
        'CREATE_PRIVATE_THREADS',
        'SEND_MESSAGES_IN_THREADS'
    ] as const,
    VOICE: [
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'PRIORITY_SPEAKER',
        'STREAM',
        'REQUEST_TO_SPEAK'
    ] as const,
    ADVANCED: [
        'ADMINISTRATOR',
        'MANAGE_GUILD',
        'MANAGE_ROLES',
        'VIEW_AUDIT_LOG',
        'VIEW_GUILD_INSIGHTS',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS_AND_STICKERS',
        'MANAGE_EVENTS',
        'USE_APPLICATION_COMMANDS',
        'USE_EMBEDDED_ACTIVITIES'
    ] as const,
    INVITE: ['CREATE_INSTANT_INVITE'] as const
} as const;
