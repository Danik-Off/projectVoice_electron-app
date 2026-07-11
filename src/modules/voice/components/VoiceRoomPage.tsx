import React from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { useUserProfile, ClickableAvatar } from '../../../shared';
import { authStore } from '../../../core';
import HeadphonesIcon from '../../../icons/HeadphonesIcon';
import MicIcon from '../../../icons/Micro';
import voiceRoomStore from '../store/roomStore';
import type { Participant } from '../types/roomStore.types';
import './VoiceRoomPage.scss';

const VoiceRoomPage: React.FC = observer(() => {
    const { roomId } = useParams<{ roomId: string }>();
    const { openProfile } = useUserProfile();
    const currentUser = authStore.user;
    const currentVoiceChannel = voiceRoomStore.currentVoiceChannel;
    const isLocalSpeaking = voiceRoomStore.getLocalSpeakingState();

    // Канал ещё не подключён (например, прямой переход по ссылке или обновление страницы)
    if (currentVoiceChannel == null || String(currentVoiceChannel.id) !== roomId) {
        return (
            <div className="voice-room-page voice-room-page--empty">
                <div className="voice-room-page__empty-icon">
                    <HeadphonesIcon isDeafened={false} />
                </div>
                <p className="voice-room-page__empty-text">Не подключено к этому голосовому каналу</p>
            </div>
        );
    }

    return (
        <div className="voice-room-page">
            <div className="voice-room-page__header">
                <HeadphonesIcon isDeafened={false} />
                <h2 className="voice-room-page__title">{currentVoiceChannel.name}</h2>
                <span className="voice-room-page__count">{voiceRoomStore.participants.length + 1}</span>
            </div>

            <div className="voice-room-page__grid">
                {currentUser != null ? (
                    <div
                        className={`voice-room-page__tile ${isLocalSpeaking ? 'voice-room-page__tile--speaking' : ''}`}
                    >
                        <ClickableAvatar
                            user={currentUser}
                            size="large"
                            onClick={() => openProfile(currentUser, true)}
                            className="voice-room-page__avatar"
                        />
                        <span className="voice-room-page__name">{currentUser.username} (Вы)</span>
                    </div>
                ) : null}

                {voiceRoomStore.participants.map((participant: Participant) => (
                    <div
                        key={participant.socketId}
                        className={`voice-room-page__tile ${participant.isSpeaking === true ? 'voice-room-page__tile--speaking' : ''}`}
                    >
                        {participant.userData != null ? (
                            <ClickableAvatar
                                user={{
                                    ...participant.userData,
                                    email: `${participant.userData.username}@temp.com`,
                                    isActive: true,
                                    createdAt: new Date().toISOString(),
                                    status: 'online'
                                }}
                                size="large"
                                onClick={() => {
                                    if (participant.userData != null) {
                                        openProfile(
                                            {
                                                ...participant.userData,
                                                email: `${participant.userData.username}@temp.com`,
                                                isActive: true,
                                                createdAt: new Date().toISOString(),
                                                status: 'online'
                                            },
                                            false
                                        );
                                    }
                                }}
                                className="voice-room-page__avatar"
                            />
                        ) : null}
                        <span className="voice-room-page__name">
                            {participant.userData?.username ?? 'Unknown User'}
                        </span>
                        <span className="voice-room-page__mic">
                            <MicIcon isMuted={participant.micToggle !== true} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default VoiceRoomPage;
