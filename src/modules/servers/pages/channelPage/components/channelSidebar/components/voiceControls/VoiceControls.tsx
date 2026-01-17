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

    // Если не подключен к голосовому каналу, не показываем контролы
    if (!currentVoiceChannel) {
        return null;
    }

    return (
        <div className={`voice-controls ${isExpanded ? 'voice-controls--expanded' : ''}`}>
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

            {isExpanded ? (
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
