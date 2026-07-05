export interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
    isActive?: boolean;
    profilePicture?: string;
    bio?: string;
    status?: string;
    tag?: string;
    createdAt?: string;
    updatedAt?: string;
    blockedAt?: string;
    blockedBy?: string;
    blockReason?: string;
}

// Явный экспорт для совместимости
export type { User as UserType };
