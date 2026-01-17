// src/components/ChannelSidebar/VoiceChannel.tsx
import React from 'react';

interface VoiceChannelProps {
    name: string;
}

const VoiceChannel: React.FC<VoiceChannelProps> = ({ name: channelName }) => (
    <div className="voice-channel">{channelName}</div>
);

export default VoiceChannel;
