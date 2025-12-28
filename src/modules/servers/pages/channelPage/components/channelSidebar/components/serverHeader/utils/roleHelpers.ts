export const getRoleIcon = (role: string) => {
    switch (role) {
        case 'owner': return '👑';
        case 'admin': return '🛡️';
        case 'moderator': return '⚡';
        default: return '👤';
    }
};

export const getRoleColor = (role: string) => {
    switch (role) {
        case 'owner': return '#ffd700';
        case 'admin': return '#ff6b6b';
        case 'moderator': return '#4ecdc4';
        default: return '#95a5a6';
    }
};

