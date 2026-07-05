import React from 'react';

interface HeadphonesIconProps {
    isDeafened: boolean;
}

const HeadphonesIcon: React.FC<HeadphonesIconProps> = ({ isDeafened }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 1a5 5 0 0 0-5 5v1.05a2.5 2.5 0 0 0-2 2.45v2a2.5 2.5 0 0 0 2.5 2.5H4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-.9V6a4.9 4.9 0 1 1 9.8 0v3h-.9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5a2.5 2.5 0 0 0 2.5-2.5v-2a2.5 2.5 0 0 0-2-2.45V6a5 5 0 0 0-5-5Z" />
        {isDeafened ? (
            <line x1="2.5" y1="2.5" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : null}
    </svg>
);

export default HeadphonesIcon;
