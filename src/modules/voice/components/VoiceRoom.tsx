import React from 'react';
import './VoiceRoom.css'; // стили для оформления комнаты
import voiceRoomStore from '../store/roomStore';
import type { Participant } from '../types/roomStore.types';
import { observer } from 'mobx-react';
import { useUserProfile } from '../../../hooks/useUserProfile';
import ClickableAvatar from '../../../components/ClickableAvatar';
import { authStore } from '../../../core';
import type { User } from '../../../types/user';

const VoiceRoom: React.FC = observer(() => {
    const { openProfile } = useUserProfile();
    const currentUser = authStore.user;
    const users = voiceRoomStore.participants;
    const isLocalSpeaking = voiceRoomStore.getLocalSpeakingState();

    return (
        <div className="voice-room">
            <h2>Voice Room</h2>

            {/* Локальный пользователь */}
            {currentUser != null ? (
                <div className={`user-box local-user ${isLocalSpeaking === true ? 'speaking' : ''}`}>
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
                        onClick={() => {
                            if (currentUser != null) {
                                const userProfile: User = {
                                    id: currentUser.id,
                                    username: currentUser.username,
                                    email: currentUser.email,
                                    profilePicture: currentUser.profilePicture,
                                    role: currentUser.role,
                                    isActive: true,
                                    createdAt: currentUser.createdAt,
                                    status: 'online'
                                };
                                openProfile(userProfile, true);
                            }
                        }}
                        className="user-avatar"
                    />
                    <div className="user-name">{currentUser.username} (Вы)</div>
                    <div className="user-status">{isLocalSpeaking === true ? '🎤 Говорит' : '🔇 Молчит'}</div>
                </div>
            ) : null}

            <div className="user-list">
                {users.map((user: Participant) => (
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
                                        const userProfile: User = {
                                            id: user.userData.id,
                                            username: user.userData.username,
                                            email: `${user.userData.username}@temp.com`,
                                            profilePicture: user.userData.profilePicture,
                                            role: user.userData.role,
                                            isActive: true,
                                            createdAt: new Date().toISOString(),
                                            status: 'online'
                                        };
                                        openProfile(userProfile, false);
                                    }
                                }}
                                className="user-avatar"
                            />
                        ) : null}
                        <div className="user-name">{user.userData?.username ?? 'Unknown User'}</div>
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
});

export default VoiceRoom;
