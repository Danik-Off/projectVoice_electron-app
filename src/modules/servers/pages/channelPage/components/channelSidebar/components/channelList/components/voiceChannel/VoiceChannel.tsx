// src/components/ChannelSidebar/VoiceChannel.tsx
import React from 'react';

interface VoiceChannelProps {
    name: string;
}

const VoiceChannel: React.FC<VoiceChannelProps> = ({ name }) => <div className="voice-channel">{name}</div>;

export default VoiceChannel;
