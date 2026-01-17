import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { eventBus, CHANNELS_EVENTS, MESSAGING_EVENTS, VOICE_EVENTS } from '../../../../../../core';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import './MessageList.scss';
import type {
    ChannelSelectedEvent,
    ChannelsLoadedEvent,
    MessagesLoadedEvent,
    VoiceChannelConnectedEvent,
    MessageCreatedEvent
} from '../../../../../../core/events/events';

interface Message {
    id: number;
    content: string;
    userId: number;
    createdAt: string;
    username?: string;
}

interface Channel {
    id: number;
    name: string;
    type: 'text' | 'voice';
    description?: string;
}

const MessageList: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);

    // Локальное состояние через события
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceConnected, setIsVoiceConnected] = useState(false);

    // Подписка на события каналов
    useEffect(() => {
        const unsubscribeSelected = eventBus.on<ChannelSelectedEvent>(CHANNELS_EVENTS.CHANNEL_SELECTED, (data) => {
            if (data) {
                setCurrentChannel(data.channel);
            }
        });

        const unsubscribeLoaded = eventBus.on<ChannelsLoadedEvent>(CHANNELS_EVENTS.CHANNELS_LOADED, (data) => {
            if (data) {
                setChannels(data.channels);
                // Автоматически выбираем канал по roomId
                if (roomId) {
                    const channel = data.channels.find((ch) => ch.id === parseInt(roomId));
                    if (channel) {
                        setCurrentChannel(channel);
                    }
                }
            }
        });

        return () => {
            unsubscribeSelected();
            unsubscribeLoaded();
        };
    }, [roomId]);

    // Подписка на события сообщений
    useEffect(() => {
        const unsubscribeLoaded = eventBus.on<MessagesLoadedEvent>(MESSAGING_EVENTS.MESSAGES_LOADED, (data) => {
            if (data && data.channelId === currentChannel?.id) {
                setMessages(data.messages);
                setLoading(false);
            }
        });

        const unsubscribeCreated = eventBus.on<MessageCreatedEvent>(MESSAGING_EVENTS.MESSAGE_CREATED, (data) => {
            if (data && data.message.channelId === currentChannel?.id) {
                setMessages((prev) => [...prev, data.message]);
            }
        });

        return () => {
            unsubscribeLoaded();
            unsubscribeCreated();
        };
    }, [currentChannel?.id]);

    // Подписка на события голосового канала
    useEffect(() => {
        const unsubscribeConnected = eventBus.on<VoiceChannelConnectedEvent>(VOICE_EVENTS.CHANNEL_CONNECTED, () => {
            setIsVoiceConnected(true);
        });

        const unsubscribeDisconnected = eventBus.on(VOICE_EVENTS.CHANNEL_DISCONNECTED, () => {
            setIsVoiceConnected(false);
        });

        return () => {
            unsubscribeConnected();
            unsubscribeDisconnected();
        };
    }, []);

    // Запрос загрузки сообщений при изменении канала
    useEffect(() => {
        if (currentChannel?.id) {
            setLoading(true);
            // Отправляем событие запроса на загрузку сообщений
            eventBus.emit(MESSAGING_EVENTS.CHANNEL_CHANGED, { channelId: currentChannel.id });
        }
    }, [currentChannel?.id]);

    // Автопрокрутка к новым сообщениям
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Проверка, находится ли пользователь внизу списка
    const checkIfNearBottom = useCallback(() => {
        if (!messagesContainerRef.current) {
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const threshold = 100;
        const isNear = scrollHeight - scrollTop - clientHeight < threshold;
        setIsNearBottom(isNear);
        setShowScrollToBottom(!isNear);
    }, []);

    // Обработчик прокрутки
    const handleScroll = useCallback(() => {
        checkIfNearBottom();
    }, [checkIfNearBottom]);

    // Автопрокрутка к новым сообщениям
    useEffect(() => {
        if (isNearBottom) {
            scrollToBottom();
        }
    }, [messages.length, isNearBottom, scrollToBottom]);

    // Группировка сообщений по пользователям
    const groupMessages = () => {
        const groups: Array<{ userId: number; messages: Message[] }> = [];

        messages.forEach((message) => {
            const lastGroup = groups[groups.length - 1];

            if (lastGroup && lastGroup.userId === message.userId) {
                lastGroup.messages.push(message);
            } else {
                groups.push({
                    userId: message.userId,
                    messages: [message]
                });
            }
        });

        return groups;
    };

    const messageGroups = groupMessages();

    const EmptyChatState: React.FC<{ channelName?: string }> = ({ channelName }) => (
        <div className="no-messages">
            <div className="no-messages-content">
                <div className="empty-chat-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                            fill="var(--accent-color)"
                            opacity="0.3"
                        />
                        <path d="M7 9H17V11H7V9ZM7 13H13V15H7V13Z" fill="var(--accent-color)" />
                    </svg>
                </div>
                <h3>Добро пожаловать в #{channelName || 'канал'}!</h3>
                <p>Это начало канала. Отправьте первое сообщение, чтобы начать общение.</p>
            </div>
        </div>
    );

    const NoChannelSelected: React.FC = () => (
        <div className="no-channel-selected">
            <div className="no-channel-content">
                <h3>Выберите канал</h3>
                <p>Выберите канал из списка слева, чтобы начать общение.</p>
            </div>
        </div>
    );

    const VoiceStatusIndicator: React.FC = () => {
        if (!isVoiceConnected) {
            return null;
        }

        return (
            <div className="voice-status-indicator">
                <div className="voice-status-icon">🔊</div>
                <span className="voice-status-text">Подключен к голосовому каналу</span>
            </div>
        );
    };

    if (!currentChannel) {
        return (
            <div className="message-list-container">
                <NoChannelSelected />
            </div>
        );
    }

    return (
        <div className="message-list-container">
            <div className="channel-header">
                <div className="channel-info">
                    <h2 className="channel-name">#{currentChannel.name}</h2>
                    <span className="channel-description">{currentChannel.description || 'Текстовый канал'}</span>
                </div>
                <VoiceStatusIndicator />
            </div>

            <div className="messages-area">
                <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
                    {loading && messages.length === 0 && (
                        <div className="loading-messages">
                            <div className="loading-spinner"></div>
                            <span>Загрузка сообщений...</span>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <span>Ошибка загрузки сообщений: {error}</span>
                        </div>
                    )}

                    {!loading && messages.length === 0 && <EmptyChatState channelName={currentChannel.name} />}

                    {messageGroups.map((group, groupIndex) => (
                        <div key={`${group.userId}-${groupIndex}`} className="message-group">
                            {group.messages.map((message, messageIndex) => (
                                <MessageItem key={message.id} message={message} isFirstInGroup={messageIndex === 0} />
                            ))}
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>

                {showScrollToBottom && (
                    <button
                        className="scroll-to-bottom-btn"
                        onClick={scrollToBottom}
                        title="Прокрутить к новым сообщениям"
                    >
                        <span>Новые сообщения</span>
                    </button>
                )}
            </div>

            <MessageInput />
        </div>
    );
};

export default MessageList;
