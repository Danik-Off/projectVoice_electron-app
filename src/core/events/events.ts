/**
 * Типы событий для связи между модулями
 * Все события должны быть определены здесь для типизации
 */

// Voice Module Events
export interface VoiceChannelConnectedEvent {
    channelId: number;
    channelName: string;
}

export interface VoiceChannelDisconnectedEvent {
    channelId: number;
}

export interface VoiceParticipantJoinedEvent {
    participant: {
        socketId: string;
        micToggle: boolean;
        userData: {
            id: number;
            username: string;
            profilePicture?: string;
            role: string;
        };
        isSpeaking?: boolean;
    };
}

export interface VoiceParticipantLeftEvent {
    socketId: string;
}

export interface VoiceParticipantsUpdatedEvent {
    participants: Array<{
        socketId: string;
        micToggle: boolean;
        userData: {
            id: number;
            username: string;
            profilePicture?: string;
            role: string;
        };
        isSpeaking?: boolean;
    }>;
}

// Channels Module Events
export interface ChannelSelectedEvent {
    channel: {
        id: number;
        name: string;
        type: 'text' | 'voice';
        description?: string;
    };
}

export interface ChannelsLoadedEvent {
    channels: Array<{
        id: number;
        name: string;
        type: 'text' | 'voice';
        description?: string;
    }>;
    serverId: number;
}

// Messaging Module Events
export interface MessageCreatedEvent {
    message: {
        id: number;
        channelId: number;
        userId: number;
        content: string;
        createdAt: string;
    };
}

export interface MessagesLoadedEvent {
    channelId: number;
    messages: Array<{
        id: number;
        content: string;
        userId: number;
        createdAt: string;
    }>;
}

// Messaging Commands (для отправки команд в messaging модуль)
export interface SendMessageCommand {
    content: string;
    channelId: number;
}

export interface UpdateMessageCommand {
    messageId: number;
    content: string;
}

export interface DeleteMessageCommand {
    messageId: number;
}

// Event Names
export const VOICE_EVENTS = {
    CHANNEL_CONNECTED: 'voice:channel:connected',
    CHANNEL_DISCONNECTED: 'voice:channel:disconnected',
    PARTICIPANT_JOINED: 'voice:participant:joined',
    PARTICIPANT_LEFT: 'voice:participant:left',
    PARTICIPANTS_UPDATED: 'voice:participants:updated',
    LOCAL_SPEAKING_STATE_CHANGED: 'voice:local:speaking:changed'
} as const;

export const CHANNELS_EVENTS = {
    CHANNEL_SELECTED: 'channels:channel:selected',
    CHANNELS_LOADED: 'channels:channels:loaded',
    CHANNEL_CREATED: 'channels:channel:created',
    CHANNEL_DELETED: 'channels:channel:deleted'
} as const;

export const MESSAGING_EVENTS = {
    MESSAGE_CREATED: 'messaging:message:created',
    MESSAGES_LOADED: 'messaging:messages:loaded',
    CHANNEL_CHANGED: 'messaging:channel:changed'
} as const;

export const MESSAGING_COMMANDS = {
    SEND_MESSAGE: 'messaging:command:send',
    UPDATE_MESSAGE: 'messaging:command:update',
    DELETE_MESSAGE: 'messaging:command:delete'
} as const;
