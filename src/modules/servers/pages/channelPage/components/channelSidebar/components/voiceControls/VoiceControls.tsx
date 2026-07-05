import React from 'react';
import { observer } from 'mobx-react-lite';
import './VoiceControls.scss';
import { authStore } from '../../../../../../../../core';
import type { Participant } from '../../../../../../../voice';
import voiceRoomStore from '../../../../../../../voice/store/roomStore';
import { useVoiceControls } from './hooks/useVoiceControls';
import MainPanel from './components/MainPanel/MainPanel';
import ExpandedPanel from './components/ExpandedPanel/ExpandedPanel';
import AudioSettingsModal from './components/AudioSettingsModal/AudioSettingsModal';

const VoiceControls: React.FC = observer(() => {
    const currentUser = authStore.user;
    const currentVoiceChannel = voiceRoomStore.currentVoiceChannel;
    const participants = voiceRoomStore.participants;
    const isLocalSpeaking = voiceRoomStore.getLocalSpeakingState();

    // Фильтруем участников, исключая текущего пользователя
    const otherParticipants = participants.filter(
        (participant: Participant) => participant.userData?.id !== currentUser?.id
    );

    const {
        isExpanded,
        showAudioSettingsModal,
        setShowAudioSettingsModal,
        handleMicToggle,
        handleDeafenToggle,
        handleDisconnect,
        handleExpand,
        handleParticipantVolumeChange,
        handleError
    } = useVoiceControls();

    // Панель видна всегда: без звонка - только локальный пользователь и настройки,
    // в звонке - дополнительно канал, участники и разворачивание списка.
    const isConnected = currentVoiceChannel != null;

    return (
        <div
            className={`voice-controls ${isConnected ? 'voice-controls--connected' : ''} ${isExpanded && isConnected ? 'voice-controls--expanded' : ''}`}
        >
            <MainPanel
                currentVoiceChannel={currentVoiceChannel}
                participantsCount={participants.length + 1}
                isLocalSpeaking={isLocalSpeaking}
                onMicToggle={handleMicToggle}
                onDeafenToggle={handleDeafenToggle}
                onDisconnect={handleDisconnect}
                onExpand={handleExpand}
                onOpenSettings={() => setShowAudioSettingsModal(true)}
            />

            {isExpanded && isConnected ? (
                <ExpandedPanel
                    participants={otherParticipants}
                    onParticipantVolumeChange={handleParticipantVolumeChange}
                />
            ) : null}

            {showAudioSettingsModal ? (
                <AudioSettingsModal onClose={() => setShowAudioSettingsModal(false)} onError={handleError} />
            ) : null}
        </div>
    );
});

export default VoiceControls;
