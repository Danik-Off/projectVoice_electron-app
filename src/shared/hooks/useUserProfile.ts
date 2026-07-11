import { useContext } from 'react';
import { UserProfileContext, type UserProfileContextType } from '../contexts/UserProfileContext';

export const useUserProfile = (): UserProfileContextType => {
    const context = useContext(UserProfileContext);
    if (context == null) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};
