import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../../../../../../types/message';
import { authStore, eventBus, MESSAGING_COMMANDS } from '../../../../../../core';
import { useUserProfile, ClickableAvatar } from '../../../../../../shared';
import './MessageItem.scss';

interface MessageItemProps {
    message: Message;
    isFirstInGroup?: boolean;
}

/* eslint-disable max-lines-per-function -- Complex component with multiple responsibilities */
/* eslint-disable complexity -- Complex component with multiple conditional branches */
const MessageItem: React.FC<MessageItemProps> = ({ message, isFirstInGroup = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const actionsTimeoutRef = useRef<number | null>(null);
    const { openProfile } = useUserProfile();

    const currentUser = authStore.user;
    // Проверка прав на редактирование/удаление
    const canEdit =
        currentUser?.id === message.userId || currentUser?.role === 'admin' || currentUser?.role === 'moderator';
    const canDelete =
        currentUser?.id === message.userId || currentUser?.role === 'admin' || currentUser?.role === 'moderator';
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
            const timeoutId = actionsTimeoutRef.current;
            if (timeoutId != null && timeoutId > 0) {
                clearTimeout(timeoutId);
            }
        },
        []
    );

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(message.content);
        setShowActions(false);
    };

    const handleSave = () => {
        if (editContent.trim().length > 0 && editContent !== message.content) {
            try {
                // Отправляем команду через eventBus
                eventBus.emit(MESSAGING_COMMANDS.UPDATE_MESSAGE, {
                    messageId: message.id,
                    content: editContent
                });
                setIsEditing(false);
            } catch (error) {
                console.error('Ошибка обновления сообщения:', error);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditContent(message.content);
    };

    const handleDelete = () => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
            setIsDeleting(true);
            try {
                // Отправляем команду через eventBus
                eventBus.emit(MESSAGING_COMMANDS.DELETE_MESSAGE, {
                    messageId: message.id
                });
            } catch (error) {
                console.error('Ошибка удаления сообщения:', error);
                setIsDeleting(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handleSaveClick = () => {
        handleSave();
    };

    const handleMouseEnter = () => {
        const timeoutId = actionsTimeoutRef.current;
        if (timeoutId != null && timeoutId > 0) {
            clearTimeout(timeoutId);
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
        if (message.isDeleted === true) {
            return '🗑️';
        }
        if (message.isEdited === true) {
            return '✏️';
        }
        return '✓';
    };

    if (message.isDeleted === true) {
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
                            {message.isEdited === true ? <span className="edit-indicator"> (изменено)</span> : null}
                        </span>
                        <div className="message-status">
                            <span className={`status-icon ${message.isDeleted === true ? 'deleted' : 'delivered'}`}>
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
                                onClick={handleSaveClick}
                                disabled={editContent.trim().length === 0}
                            >
                                {editContent.trim().length > 0 ? 'Сохранить' : 'Отмена'}
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="message-text">
                        {message.content.split('\n').map((line, index, lines) => {
                            const lineKey = `${message.id}-${line.substring(0, 20)}-${line.length}-${index}`;
                            return (
                                <React.Fragment key={lineKey}>
                                    {line}
                                    {index < lines.length - 1 && <br />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {!isFirstInGroup && (
                    <div className="message-time">
                        {formatTime(message.createdAt)}
                        {message.isEdited === true ? <span className="edit-indicator"> (изменено)</span> : null}
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
                                    handleDelete();
                                }}
                                title="Удалить"
                                disabled={isDeleting === true}
                            >
                                {isDeleting === true ? '⏳' : '🗑️'}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MessageItem;
