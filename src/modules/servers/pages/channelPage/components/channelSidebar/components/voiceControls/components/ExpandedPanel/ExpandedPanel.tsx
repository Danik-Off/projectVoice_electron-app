import React from 'react';
import { ClickableAvatar, useUserProfile } from '../../../../../../../../../../components';

import './ExpandedPanel.scss';
import type { Participant } from '../../../../../../../../../voice';
import participantVolumeStore from '../../../../../../../../../voice/store/ParticipantVolumeStore';

interface ExpandedPanelProps {
    participants: Participant[];
    onParticipantVolumeChange: (socketId: string, volume: number) => void;
}

const ExpandedPanel: React.FC<ExpandedPanelProps> = ({ participants, onParticipantVolumeChange }) => {
    const { openProfile } = useUserProfile();

    return (
        <div className="voice-controls__expanded-panel">
            <div className="voice-controls__participants-section">
                <h4 className="voice-controls__section-title">Участники ({participants.length})</h4>
                <div className="voice-controls__participants-list">
                    {participants.map((participant: Participant) => (
                        <div key={participant.socketId} className="voice-controls__participant">
                            {participant.userData != null ? (
                                <ClickableAvatar
                                    user={{
                                        ...participant.userData,
                                        email: `${participant.userData.username}@temp.com`,
                                        isActive: true,
                                        createdAt: new Date().toISOString(),
                                        status: 'online'
                                    }}
                                    size="small"
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
                                    className={`voice-controls__participant-avatar ${participant.isSpeaking === true ? 'voice-controls__participant-avatar--speaking' : ''}`}
                                />
                            ) : null}

                            <div className="voice-controls__participant-info">
                                <span className="voice-controls__participant-name">
                                    {participant.userData?.username ?? 'Unknown User'}
                                </span>
                                <span
                                    className={`voice-controls__participant-status ${participant.isSpeaking === true ? 'voice-controls__participant-status--speaking' : ''}`}
                                >
                                    {participant.isSpeaking === true
                                        ? 'Говорит'
                                        : participant.micToggle === true
                                          ? 'Молчит'
                                          : 'Микрофон выключен'}
                                </span>
                            </div>
                            <div className="voice-controls__participant-controls">
                                <div className="voice-controls__participant-mic">
                                    {participant.micToggle === true ? '🎤' : '🔇'}
                                </div>
                                <div className="voice-controls__participant-volume">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={participantVolumeStore.getParticipantVolume(participant.socketId)}
                                        onChange={(e) =>
                                            onParticipantVolumeChange(participant.socketId, Number(e.target.value))
                                        }
                                        className="voice-controls__volume-slider"
                                        title={`Громкость ${participant.userData?.username ?? 'участника'}`}
                                    />
                                    <span className="voice-controls__volume-value">
                                        {participantVolumeStore.getParticipantVolume(participant.socketId)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExpandedPanel;
