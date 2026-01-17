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
    // eslint-disable-next-line require-await -- Returns promise directly
    getMe: async () =>
        apiClient('/auth/me', {
            method: 'GET'
        })
};
