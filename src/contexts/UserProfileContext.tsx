import { createContext } from 'react';
import type { User } from '../types/user';

export interface UserProfileContextType {
    openProfile: (user: User, isOwnProfile?: boolean) => void;
    closeProfile: () => void;
}

export const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

