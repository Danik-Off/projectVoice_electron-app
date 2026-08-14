/**
 * Типы для личных сообщений (Direct Messages).
 *
 * Соответствуют новому NestJS API (http://localhost:5000/api#/DirectMessages).
 */

/** Личное сообщение */
export interface DirectMessage {
    id: number;
    content: string;
    senderId: number;
    recipientId: number;
    createdAt: string;
    updatedAt: string;
    isEdited?: boolean;
}

/** Диалог с последним сообщением */
export interface DirectMessageConversation {
    user: {
        id: number;
        username: string;
        profilePicture?: string | null;
        status?: string;
        tag?: string;
    };
    lastMessage: DirectMessage | null;
}

/** DTO для создания личного сообщения */
export interface CreateDirectMessageRequest {
    recipientId: number;
    content: string;
}

/** DTO для обновления личного сообщения */
export interface UpdateDirectMessageRequest {
    content: string;
}

/** Пагинированный ответ истории сообщений */
export interface DirectMessageResponse {
    messages: DirectMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Фильтры для загрузки истории */
export interface DirectMessageFilters {
    userId: number;
    page?: number;
    limit?: number;
}
