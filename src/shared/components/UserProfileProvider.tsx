import React, { type ReactNode, useMemo } from 'react';
import { useUserProfileModal } from '../hooks/useUserProfileModal';
import UserProfileModal from './UserProfileModal';
import { UserProfileContext, type UserProfileContextType } from '../contexts/UserProfileContext';

interface UserProfileProviderProps {
    children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
    const { isOpen, user, isOwnProfile, openProfile, closeProfile } = useUserProfileModal();

    const contextValue: UserProfileContextType = useMemo(
        () => ({
            openProfile,
            closeProfile
        }),
        [openProfile, closeProfile]
    );

    return (
        <UserProfileContext.Provider value={contextValue}>
            {children}
            <UserProfileModal isOpen={isOpen} onClose={closeProfile} user={user} isOwnProfile={isOwnProfile} />
        </UserProfileContext.Provider>
    );
};
