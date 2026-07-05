/**
 * FriendsService — сервис для работы с API друзей.
 *
 * Соответствует endpoint'ам бэкенда:
 * - GET    /api/friends/                    — список друзей
 * - GET    /api/friends/requests            — входящие запросы
 * - POST   /api/friends/request             — отправить запрос
 * - POST   /api/friends/accept/{requestId}  — принять запрос
 * - DELETE /api/friends/{id}                — удалить друга
 * - POST   /api/friends/block/{targetUserId}— заблокировать
 * - GET    /api/friends/blocked             — список заблокированных
 */

import { apiClient } from '../../../core';
import type { Friendship, SendFriendRequestDTO, FriendWithUser } from '../types/friendship';

class FriendsService {
    /** Получить список друзей (GET /friends/) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getFriends(): Promise<FriendWithUser[]> {
        return apiClient('/friends/', { method: 'GET' });
    }

    /** Получить входящие запросы на дружбу (GET /friends/requests) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getFriendRequests(): Promise<FriendWithUser[]> {
        return apiClient('/friends/requests', { method: 'GET' });
    }

    /** Отправить запрос на дружбу (POST /friends/request) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async sendFriendRequest(data: SendFriendRequestDTO): Promise<Friendship> {
        return apiClient('/friends/request', { method: 'POST' }, data);
    }

    /** Принять запрос на дружбу (POST /friends/accept/{requestId}) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async acceptFriendRequest(requestId: number): Promise<Friendship> {
        return apiClient(`/friends/accept/${requestId}`, { method: 'POST' });
    }

    /** Удалить друга (DELETE /friends/{id}) */
    async removeFriend(id: number): Promise<void> {
        await apiClient(`/friends/${id}`, { method: 'DELETE' });
    }

    /** Заблокировать пользователя (POST /friends/block/{targetUserId}) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async blockUser(targetUserId: number): Promise<void> {
        return apiClient(`/friends/block/${targetUserId}`, { method: 'POST' });
    }

    /** Получить список заблокированных пользователей (GET /friends/blocked) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getBlockedUsers(): Promise<FriendWithUser[]> {
        return apiClient('/friends/blocked', { method: 'GET' });
    }
}

export const friendsService = new FriendsService();
