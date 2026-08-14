/**
 * DirectMessageService — сервис для работы с личными сообщениями.
 *
 * Соответствует endpoint'ам нового NestJS бэкенда:
 * - GET    /api/direct-messages/conversations  — список диалогов
 * - GET    /api/direct-messages/:userId         — история переписки (пагинация)
 * - POST   /api/direct-messages                 — отправить сообщение
 * - PUT    /api/direct-messages/:id             — редактировать сообщение
 * - DELETE /api/direct-messages/:id             — удалить сообщение
 */

import { apiClient } from '../../../core';
import type {
    DirectMessage,
    DirectMessageConversation,
    CreateDirectMessageRequest,
    UpdateDirectMessageRequest,
    DirectMessageResponse
} from '../types/directMessage';

class DirectMessageService {
    /** Получить список диалогов (GET /direct-messages/conversations) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getConversations(): Promise<DirectMessageConversation[]> {
        return apiClient('/direct-messages/conversations', { method: 'GET' });
    }

    /** Получить историю переписки с пользователем (GET /direct-messages/:userId) */
    getMessages(userId: number, page?: number, limit?: number): Promise<DirectMessageResponse> {
        const params = new URLSearchParams();
        if (page != null && page !== 0) {
            params.append('page', page.toString());
        }
        if (limit != null && limit !== 0) {
            params.append('limit', limit.toString());
        }

        const query = params.toString();
        return apiClient(`/direct-messages/${userId}${query !== '' ? `?${query}` : ''}`, { method: 'GET' });
    }

    /** Отправить личное сообщение (POST /direct-messages) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async createMessage(data: CreateDirectMessageRequest): Promise<DirectMessage> {
        return apiClient('/direct-messages', { method: 'POST' }, data);
    }

    /** Редактировать личное сообщение (PUT /direct-messages/:id) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async updateMessage(messageId: number, data: UpdateDirectMessageRequest): Promise<DirectMessage> {
        return apiClient(`/direct-messages/${messageId}`, { method: 'PUT' }, data);
    }

    /** Удалить личное сообщение (DELETE /direct-messages/:id) */
    async deleteMessage(messageId: number): Promise<void> {
        await apiClient(`/direct-messages/${messageId}`, { method: 'DELETE' });
    }
}

export const directMessageService = new DirectMessageService();
