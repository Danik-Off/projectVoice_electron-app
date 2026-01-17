// src/components/ChannelSidebar/TextChannel.tsx
import React from 'react';

interface TextChannelProps {
    name: string;
}

const TextChannel: React.FC<TextChannelProps> = ({ name: channelName }) => (
    <div className="text-channel">{channelName}</div>
);

export default TextChannel;
