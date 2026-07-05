import React from 'react';

interface ChevronIconProps {
    direction?: 'up' | 'down';
}

const ChevronIcon: React.FC<ChevronIconProps> = ({ direction = 'down' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
    >
        <path d="M4 6l4 4 4-4" />
    </svg>
);

export default ChevronIcon;
