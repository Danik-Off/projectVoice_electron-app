import { apiClient } from '../core';
import type {
    Message,
    CreateMessageRequest,
    UpdateMessageRequest,
    MessageResponse,
    MessageFilters
} from '../types/message';

class MessageService {
    // Получение сообщений канала с пагинацией
    // eslint-disable-next-line require-await -- Returns promise directly
    async getMessages(filters: MessageFilters): Promise<MessageResponse> {
        const params = new URLSearchParams();
        if (filters.page != null && filters.page > 0) {
            params.append('page', filters.page.toString());
        }
        if (filters.limit != null && filters.limit > 0) {
            params.append('limit', filters.limit.toString());
        }
        params.append('channelId', filters.channelId.toString());

        return apiClient(`/messages?${params.toString()}`, { method: 'GET' });
    }

    // Создание нового сообщения
    // eslint-disable-next-line require-await -- Returns promise directly
    async createMessage(data: CreateMessageRequest): Promise<Message> {
        return apiClient('/messages', { method: 'POST' }, data);
    }

    // Обновление сообщения
    // eslint-disable-next-line require-await -- Returns promise directly
    async updateMessage(messageId: number, data: UpdateMessageRequest): Promise<Message> {
        return apiClient(`/messages/${messageId}`, { method: 'PUT' }, data);
    }

    // Удаление сообщения
    async deleteMessage(messageId: number): Promise<void> {
        await apiClient(`/messages/${messageId}`, { method: 'DELETE' });
    }

    // Получение одного сообщения
    // eslint-disable-next-line require-await -- Returns promise directly
    async getMessage(messageId: number): Promise<Message> {
        return apiClient(`/messages/${messageId}`, { method: 'GET' });
    }

    // Поиск сообщений
    // eslint-disable-next-line require-await -- Returns promise directly
    async searchMessages(query: string, channelId: number): Promise<MessageResponse> {
        const params = new URLSearchParams();
        params.append('query', query);
        params.append('channelId', channelId.toString());

        return apiClient(`/messages/search?${params.toString()}`, { method: 'GET' });
    }
}

export const messageService = new MessageService();
