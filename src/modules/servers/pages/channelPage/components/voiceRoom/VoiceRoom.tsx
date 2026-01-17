import React, { useState, useEffect } from 'react';
import './VoiceRoom.css'; // стили для оформления комнаты
import { eventBus, VOICE_EVENTS, authStore } from '../../../../../../core';
import { useUserProfile } from '../../../../../../hooks/useUserProfile';
import ClickableAvatar from '../../../../../../components/ClickableAvatar';
import type {
    VoiceParticipantJoinedEvent,
    VoiceParticipantLeftEvent,
    VoiceParticipantsUpdatedEvent
} from '../../../../../../core/events/events';

interface Participant {
    socketId: string;
    micToggle: boolean;
    userData: {
        id: number;
        username: string;
        profilePicture?: string;
        role: string;
    };
    isSpeaking?: boolean;
}

const VoiceRoom: React.FC = () => {
    const { openProfile } = useUserProfile();
    const currentUser = authStore.user;
    const [users, setUsers] = useState<Participant[]>([]);
    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    // Подписка на события участников
    useEffect(() => {
        const unsubscribeJoined = eventBus.on<VoiceParticipantJoinedEvent>(VOICE_EVENTS.PARTICIPANT_JOINED, (data) => {
            if (data) {
                setUsers((prev) => [...prev, data.participant]);
            }
        });

        const unsubscribeLeft = eventBus.on<VoiceParticipantLeftEvent>(VOICE_EVENTS.PARTICIPANT_LEFT, (data) => {
            if (data) {
                setUsers((prev) => prev.filter((u) => u.socketId !== data.socketId));
            }
        });

        const unsubscribeUpdated = eventBus.on<VoiceParticipantsUpdatedEvent>(
            VOICE_EVENTS.PARTICIPANTS_UPDATED,
            (data) => {
                if (data) {
                    setUsers(data.participants);
                }
            }
        );

        const unsubscribeLocalSpeaking = eventBus.on<{ isSpeaking: boolean }>(
            VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED,
            (data) => {
                if (data) {
                    setIsLocalSpeaking(data.isSpeaking);
                }
            }
        );

        return () => {
            unsubscribeJoined();
            unsubscribeLeft();
            unsubscribeUpdated();
            unsubscribeLocalSpeaking();
        };
    }, []);

    return (
        <div className="voice-room">
            <h2>Voice Room</h2>

            {/* Локальный пользователь */}
            {currentUser && (
                <div className={`user-box local-user ${isLocalSpeaking ? 'speaking' : ''}`}>
                    <ClickableAvatar
                        user={{
                            id: currentUser.id,
                            username: currentUser.username,
                            email: currentUser.email,
                            profilePicture: currentUser.profilePicture,
                            role: currentUser.role,
                            isActive: true,
                            createdAt: currentUser.createdAt,
                            status: 'online'
                        }}
                        size="medium"
                        onClick={() => openProfile(currentUser, true)}
                        className="user-avatar"
                    />
                    <div className="user-name">{currentUser.username} (Вы)</div>
                    <div className="user-status">{isLocalSpeaking ? '🎤 Говорит' : '🔇 Молчит'}</div>
                </div>
            )}

            <div className="user-list">
                {users.map((user) => (
                    <div key={user.socketId} className={`user-box ${user.isSpeaking ? 'speaking' : ''}`}>
                        {user.userData && (
                            <ClickableAvatar
                                user={{
                                    id: user.userData.id,
                                    username: user.userData.username,
                                    email: `${user.userData.username}@temp.com`,
                                    profilePicture: user.userData.profilePicture,
                                    role: user.userData.role,
                                    isActive: true,
                                    createdAt: new Date().toISOString(),
                                    status: 'online'
                                }}
                                size="medium"
                                onClick={() => {
                                    if (user.userData) {
                                        openProfile(
                                            {
                                                id: user.userData.id,
                                                username: user.userData.username,
                                                email: `${user.userData.username}@temp.com`,
                                                profilePicture: user.userData.profilePicture,
                                                role: user.userData.role,
                                                isActive: true,
                                                createdAt: new Date().toISOString(),
                                                status: 'online'
                                            },
                                            false
                                        );
                                    }
                                }}
                                className="user-avatar"
                            />
                        )}
                        <div className="user-name">{user.userData?.username || 'Unknown User'}</div>
                        <div className="user-status">
                            {user.isSpeaking ? '🎤 Говорит' : user.micToggle ? '🔇 Молчит' : '🔇 Выключен'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceRoom;
