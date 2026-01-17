// src/components/ChannelSidebar/TextChannel.tsx
import React from 'react';

interface TextChannelProps {
    name: string;
}

const TextChannel: React.FC<TextChannelProps> = ({ name }) => <div className="text-channel">{name}</div>;

export default TextChannel;
