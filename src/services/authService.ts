import { apiClient } from '../core';

export const authService = {
    login: async (email: string, password: string) => {
        const data = await apiClient(
            '/auth/login',
            {
                method: 'POST'
            },
            { email, password }
        );
        return data;
    },
    register: async (email: string, username: string, password: string) => {
        const data = await apiClient(
            '/auth/register',
            {
                method: 'POST'
            },
            { email, username, password }
        );
        return data;
    },
    getMe: async () => await apiClient('/auth/me', {
        method: 'GET'
    })
};
