import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import type { Message } from '../types/message';
import { messageStore } from '../store/messageStore';
import { authStore } from '../../../core';
import { useUserProfile, ClickableAvatar } from '../../../shared';
import './MessageItem.scss';

interface MessageItemProps {
    message: Message;
    isFirstInGroup?: boolean;
}

/* eslint-disable max-lines-per-function, complexity */
const MessageItem: React.FC<MessageItemProps> = observer(({ message, isFirstInGroup = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const actionsTimeoutRef = useRef<number | null>(null);
    const { openProfile } = useUserProfile();

    const currentUser = authStore.user;
    const canEdit = messageStore.canEditMessage(message);
    const canDelete = messageStore.canDeleteMessage(message);
    const isOwnMessage = currentUser?.id === message.userId;

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.setSelectionRange(
                editInputRef.current.value.length,
                editInputRef.current.value.length
            );
        }
    }, [isEditing]);

    useEffect(
        () => () => {
            if (actionsTimeoutRef.current != null) {
                clearTimeout(actionsTimeoutRef.current);
            }
        },
        []
    );

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(message.content);
        setShowActions(false);
    };

    const handleSave = async () => {
        if (editContent.trim() && editContent !== message.content) {
            try {
                await messageStore.updateMessage(message.id, editContent);
                setIsEditing(false);
            } catch (error) {
                console.error('Ошибка обновления сообщения:', error);
                // Здесь можно добавить уведомление об ошибке
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditContent(message.content);
    };

    const handleDelete = async () => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
            setIsDeleting(true);
            try {
                await messageStore.deleteMessage(message.id);
            } catch (error) {
                console.error('Ошибка удаления сообщения:', error);
                setIsDeleting(false);
                // Здесь можно добавить уведомление об ошибке
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave().catch((error: unknown) => {
                console.error('Error saving message on Enter:', error);
            });
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handleMouseEnter = () => {
        if (actionsTimeoutRef.current != null) {
            clearTimeout(actionsTimeoutRef.current);
        }
        setShowActions(true);
    };

    const handleMouseLeave = () => {
        actionsTimeoutRef.current = setTimeout(() => {
            setShowActions(false);
        }, 300);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        if (diffInHours < 168) {
            // 7 дней
            return date.toLocaleDateString('ru-RU', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusIcon = () => {
        if (message.isDeleted != null && message.isDeleted) {
            return '🗑️';
        }
        if (message.isEdited != null && message.isEdited) {
            return '✏️';
        }
        return '✓';
    };

    if (message.isDeleted != null && message.isDeleted) {
        return (
            <div className="message-item system-message deleted-message">
                <div className="message-content">
                    <em>Сообщение было удалено</em>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`message-item ${isOwnMessage ? 'own-message' : ''} ${isDeleting ? 'deleting' : ''}`}
            ref={messageRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isFirstInGroup && message.user ? (
                <ClickableAvatar
                    user={{
                        id: message.user.id || 0,
                        username: message.user.username || 'Unknown',
                        email: `${message.user.username || 'unknown'}@temp.com`,
                        profilePicture: message.user.avatar,
                        role: 'member',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        status: 'online'
                    }}
                    size="medium"
                    onClick={() => {
                        if (message.user) {
                            openProfile(
                                {
                                    id: message.user.id || 0,
                                    username: message.user.username || 'Unknown',
                                    email: `${message.user.username || 'unknown'}@temp.com`,
                                    profilePicture: message.user.avatar,
                                    role: 'member',
                                    isActive: true,
                                    createdAt: new Date().toISOString(),
                                    status: 'online'
                                },
                                false
                            );
                        }
                    }}
                    className="message-avatar"
                />
            ) : null}

            <div className="message-content">
                {isFirstInGroup ? (
                    <div className="message-header">
                        <span className="message-author">{message.user?.username ?? 'Неизвестный пользователь'}</span>
                        <span className="message-time">
                            {formatTime(message.createdAt)}
                            {message.isEdited != null && message.isEdited ? (
                                <span className="edit-indicator"> (изменено)</span>
                            ) : null}
                        </span>
                        <div className="message-status">
                            <span
                                className={`status-icon ${message.isDeleted != null && message.isDeleted ? 'deleted' : 'delivered'}`}
                            >
                                {getStatusIcon()}
                            </span>
                        </div>
                    </div>
                ) : null}

                {isEditing ? (
                    <div className="edit-form">
                        <textarea
                            ref={editInputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите сообщение..."
                            rows={Math.min(editContent.split('\n').length + 1, 10)}
                            className="message-textarea"
                            maxLength={2000}
                        />
                        <div className="edit-actions">
                            <button
                                className="save-btn"
                                onClick={() => {
                                    handleSave().catch((error: unknown) => {
                                        console.error('Error saving message:', error);
                                    });
                                }}
                                disabled={!editContent.trim()}
                            >
                                {editContent.trim() ? 'Сохранить' : 'Отмена'}
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="message-text">
                        {message.content
                            .split('\n')
                            .reduce((acc: React.ReactElement[], line: string, index: number, lines: string[]) => {
                                acc.push(
                                    <React.Fragment key={`${message.id}-frag-${line.slice(0, 20)}-${acc.length}`}>
                                        {line}
                                    </React.Fragment>
                                );
                                if (index < lines.length - 1) {
                                    acc.push(<br key={`${message.id}-br-${acc.length}`} />);
                                }
                                return acc;
                            }, [])}
                    </div>
                )}

                {!isFirstInGroup && (
                    <div className="message-time">
                        {formatTime(message.createdAt)}
                        {message.isEdited != null && message.isEdited ? (
                            <span className="edit-indicator"> (изменено)</span>
                        ) : null}
                    </div>
                )}

                {(canEdit || canDelete) && showActions ? (
                    <div className="message-actions">
                        {canEdit ? (
                            <button
                                className="action-btn edit-btn"
                                onClick={handleEdit}
                                title="Редактировать"
                                disabled={isEditing}
                            >
                                ✏️
                            </button>
                        ) : null}
                        {canDelete ? (
                            <button
                                className="action-btn delete-btn"
                                onClick={() => {
                                    handleDelete().catch((error: unknown) => {
                                        console.error('Error deleting message:', error);
                                    });
                                }}
                                title="Удалить"
                                disabled={isDeleting}
                            >
                                {isDeleting ? '⏳' : '🗑️'}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
});

export default MessageItem;
