import { apiClient } from '../../../core';

export const userService = {
    get: async (id: number | null = null) => {
        const data = await apiClient(`/auth/users/${id}`, {
            method: 'GET'
        });
        return data;
    },

    updateProfile: async (id: number, profileData: { username: string; email: string }) => {
        const data = await apiClient(
            `/auth/users/${id}`,
            {
                method: 'PUT'
            },
            profileData
        );
        return data;
    },

    changePassword: async (id: number, oldPassword: string, newPassword: string) => {
        const data = await apiClient(
            `/auth/users/${id}/password`,
            {
                method: 'PUT'
            },
            { oldPassword, newPassword }
        );
        return data;
    }
};
