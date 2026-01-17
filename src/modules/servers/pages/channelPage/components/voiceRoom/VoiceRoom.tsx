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

/* eslint-disable max-lines-per-function -- Complex component with multiple responsibilities */
const VoiceRoom: React.FC = () => {
    const { openProfile } = useUserProfile();
    const currentUser = authStore.user;
    const [users, setUsers] = useState<Participant[]>([]);
    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    // Подписка на события участников
    useEffect(() => {
        const handleParticipantJoined = (data: unknown) => {
            if (data != null && typeof data === 'object' && 'participant' in data) {
                const participant = (data as { participant: Participant }).participant;
                setUsers((prev) => [...prev, participant]);
            }
        };

        const handleParticipantLeft = (data: unknown) => {
            if (data != null && typeof data === 'object' && 'socketId' in data) {
                const socketId = (data as { socketId: string }).socketId;
                setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
            }
        };

        const handleParticipantsUpdated = (data: unknown) => {
            if (data != null && typeof data === 'object' && 'participants' in data) {
                const participants = (data as { participants: Participant[] }).participants;
                setUsers(participants);
            }
        };

        const handleLocalSpeaking = (data: unknown) => {
            if (data != null && typeof data === 'object' && 'isSpeaking' in data) {
                const isSpeaking = (data as { isSpeaking: boolean }).isSpeaking;
                setIsLocalSpeaking(isSpeaking);
            }
        };

        const unsubscribeJoined = eventBus.on<VoiceParticipantJoinedEvent>(
            VOICE_EVENTS.PARTICIPANT_JOINED,
            handleParticipantJoined
        );
        const unsubscribeLeft = eventBus.on<VoiceParticipantLeftEvent>(
            VOICE_EVENTS.PARTICIPANT_LEFT,
            handleParticipantLeft
        );
        const unsubscribeUpdated = eventBus.on<VoiceParticipantsUpdatedEvent>(
            VOICE_EVENTS.PARTICIPANTS_UPDATED,
            handleParticipantsUpdated
        );
        const unsubscribeLocalSpeaking = eventBus.on<{ isSpeaking: boolean }>(
            VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED,
            handleLocalSpeaking
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
            {currentUser != null ? (
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
                    <div className="user-status">{isLocalSpeaking === true ? '🎤 Говорит' : '🔇 Молчит'}</div>
                </div>
            ) : null}

            <div className="user-list">
                {users.map((user) => (
                    <div key={user.socketId} className={`user-box ${user.isSpeaking === true ? 'speaking' : ''}`}>
                        {user.userData != null ? (
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
                                    if (user.userData != null) {
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
                        ) : null}
                        <div className="user-name">{user.userData?.username || 'Unknown User'}</div>
                        <div className="user-status">
                            {user.isSpeaking === true
                                ? '🎤 Говорит'
                                : user.micToggle === true
                                  ? '🔇 Молчит'
                                  : '🔇 Выключен'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceRoom;
