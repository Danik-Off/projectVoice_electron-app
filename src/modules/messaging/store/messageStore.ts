import { makeAutoObservable, runInAction } from 'mobx';
import { messageService } from '../services/messageService';
import type { Message, CreateMessageRequest, UpdateMessageRequest, MessageFilters } from '../types/message';
import { authStore, eventBus, MESSAGING_EVENTS, MESSAGING_COMMANDS } from '../../../core';
import type {
    MessageCreatedEvent,
    MessagesLoadedEvent,
    SendMessageCommand,
    UpdateMessageCommand,
    DeleteMessageCommand
} from '../../../core/events/events';

class MessageStore {
    messages: Message[] = [];
    currentChannelId: number | null = null;
    loading = false;
    error: string | null = null;
    currentPage = 1;
    totalPages = 1;
    totalMessages = 0;
    hasMore = true;
    searchQuery = '';

    constructor() {
        makeAutoObservable(this);
        this.setupCommandListeners();
    }

    private setupCommandListeners() {
        // Подписка на команды от других модулей
        eventBus.on<SendMessageCommand>(MESSAGING_COMMANDS.SEND_MESSAGE, async (data) => {
            if (data) {
                // Устанавливаем канал, если он указан в команде
                if (data.channelId && data.channelId !== this.currentChannelId) {
                    this.setCurrentChannel(data.channelId);
                }
                // Отправляем сообщение
                if (this.currentChannelId) {
                    await this.sendMessage(data.content);
                }
            }
        });

        eventBus.on<UpdateMessageCommand>(MESSAGING_COMMANDS.UPDATE_MESSAGE, async (data) => {
            if (data) {
                await this.updateMessage(data.messageId, { content: data.content });
            }
        });

        eventBus.on<DeleteMessageCommand>(MESSAGING_COMMANDS.DELETE_MESSAGE, async (data) => {
            if (data) {
                await this.deleteMessage(data.messageId);
            }
        });
    }

    // Установка текущего канала
    setCurrentChannel(channelId: number) {
        this.currentChannelId = channelId;
        this.messages = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalMessages = 0;
        this.hasMore = true;
        this.searchQuery = '';

        // Публикуем событие об изменении канала
        eventBus.emit(MESSAGING_EVENTS.CHANNEL_CHANGED, { channelId });

        this.loadMessages();
    }

    // Загрузка сообщений
    async loadMessages(page = 1, append = false) {
        if (!this.currentChannelId) {
            return;
        }

        try {
            this.loading = true;
            this.error = null;

            const filters: MessageFilters = {
                channelId: this.currentChannelId,
                page,
                limit: 50
            };

            const response = await messageService.getMessages(filters);

            runInAction(() => {
                if (append) {
                    this.messages = [...this.messages, ...response.messages];
                } else {
                    this.messages = response.messages;
                }

                this.currentPage = response.page;
                this.totalPages = response.totalPages;
                this.totalMessages = response.total;
                this.hasMore = response.page < response.totalPages;
            });

            // Публикуем событие о загрузке сообщений
            eventBus.emit(MESSAGING_EVENTS.MESSAGES_LOADED, {
                channelId: this.currentChannelId,
                messages: response.messages.map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    userId: msg.userId,
                    createdAt: msg.createdAt
                }))
            } as MessagesLoadedEvent);
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка загрузки сообщений';
                console.error('Ошибка загрузки сообщений:', error);
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    // Загрузка предыдущих сообщений (для пагинации)
    async loadMoreMessages() {
        if (this.hasMore && !this.loading) {
            await this.loadMessages(this.currentPage + 1, true);
        }
    }

    // Отправка нового сообщения
    async sendMessage(content: string) {
        if (!this.currentChannelId || !content.trim()) {
            return;
        }

        try {
            const messageData: CreateMessageRequest = {
                content: content.trim(),
                channelId: this.currentChannelId
            };

            const newMessage = await messageService.createMessage(messageData);

            runInAction(() => {
                this.messages.push(newMessage);
                this.totalMessages++;
            });

            // Публикуем событие о создании сообщения
            eventBus.emit(MESSAGING_EVENTS.MESSAGE_CREATED, {
                message: {
                    id: newMessage.id,
                    channelId: newMessage.channelId,
                    userId: newMessage.userId,
                    content: newMessage.content,
                    createdAt: newMessage.createdAt
                }
            } as MessageCreatedEvent);

            return newMessage;
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка отправки сообщения';
                console.error('Ошибка отправки сообщения:', error);
            });
            throw error;
        }
    }

    // Обновление сообщения
    async updateMessage(messageId: number, content: string) {
        if (!content.trim()) {
            return;
        }

        try {
            const updateData: UpdateMessageRequest = {
                content: content.trim()
            };

            const updatedMessage = await messageService.updateMessage(messageId, updateData);

            runInAction(() => {
                const index = this.messages.findIndex((msg) => msg.id === messageId);
                if (index !== -1) {
                    this.messages[index] = { ...this.messages[index], ...updatedMessage, isEdited: true };
                }
            });

            return updatedMessage;
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка обновления сообщения';
                console.error('Ошибка обновления сообщения:', error);
            });
            throw error;
        }
    }

    // Удаление сообщения
    async deleteMessage(messageId: number) {
        try {
            await messageService.deleteMessage(messageId);

            runInAction(() => {
                const index = this.messages.findIndex((msg) => msg.id === messageId);
                if (index !== -1) {
                    this.messages[index] = { ...this.messages[index], isDeleted: true };
                }
                this.totalMessages--;
            });
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка удаления сообщения';
                console.error('Ошибка удаления сообщения:', error);
            });
            throw error;
        }
    }

    // Поиск сообщений
    async searchMessages(query: string) {
        if (!this.currentChannelId || !query.trim()) {
            return;
        }

        try {
            this.loading = true;
            this.error = null;
            this.searchQuery = query;

            const response = await messageService.searchMessages(query, this.currentChannelId);

            runInAction(() => {
                this.messages = response.messages;
                this.currentPage = response.page;
                this.totalPages = response.totalPages;
                this.totalMessages = response.total;
                this.hasMore = response.page < response.totalPages;
            });
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка поиска сообщений';
                console.error('Ошибка поиска сообщений:', error);
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    // Очистка поиска
    clearSearch() {
        this.searchQuery = '';
        this.loadMessages(1, false);
    }

    // Добавление сообщения в реальном времени (для WebSocket)
    addMessageRealtime(message: Message) {
        if (message.channelId === this.currentChannelId) {
            runInAction(() => {
                this.messages.push(message);
                this.totalMessages++;
            });
        }
    }

    // Обновление сообщения в реальном времени
    updateMessageRealtime(message: Message) {
        runInAction(() => {
            const index = this.messages.findIndex((msg) => msg.id === message.id);
            if (index !== -1) {
                this.messages[index] = { ...this.messages[index], ...message, isEdited: true };
            }
        });
    }

    // Удаление сообщения в реальном времени
    deleteMessageRealtime(messageId: number) {
        runInAction(() => {
            const index = this.messages.findIndex((msg) => msg.id === messageId);
            if (index !== -1) {
                this.messages[index] = { ...this.messages[index], isDeleted: true };
            }
            this.totalMessages--;
        });
    }

    // Проверка, может ли пользователь редактировать сообщение
    canEditMessage(message: Message): boolean {
        return (
            authStore.user?.id === message.userId ||
            authStore.user?.role === 'admin' ||
            authStore.user?.role === 'moderator'
        );
    }

    // Проверка, может ли пользователь удалить сообщение
    canDeleteMessage(message: Message): boolean {
        return (
            authStore.user?.id === message.userId ||
            authStore.user?.role === 'admin' ||
            authStore.user?.role === 'moderator'
        );
    }

    // Очистка состояния
    clear() {
        this.messages = [];
        this.currentChannelId = null;
        this.loading = false;
        this.error = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalMessages = 0;
        this.hasMore = true;
        this.searchQuery = '';
    }
}

export const messageStore = new MessageStore();
