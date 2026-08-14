/**
 * FriendsService — сервис для работы с API друзей.
 *
 * Соответствует endpoint'ам нового NestJS бэкенда:
 * - GET    /api/friends                       — список друзей (плоские объекты пользователей)
 * - GET    /api/friends/requests              — { incoming: [...], outgoing: [...] }
 * - POST   /api/friends/request               — отправить запрос
 * - POST   /api/friends/accept/:requestId     — принять запрос
 * - DELETE /api/friends/:id                   — удалить друга / отклонить запрос
 * - POST   /api/friends/block/:targetUserId   — заблокировать
 * - GET    /api/friends/blocked               — список заблокированных
 */

import { apiClient } from '../../../core';
import type {
    FriendUser,
    FriendRequestsResponse,
    SendFriendRequestDTO,
    SendFriendRequestResponse,
    AcceptFriendRequestResponse,
    RemoveFriendResponse,
    BlockUserResponse
} from '../types/friendship';

class FriendsService {
    /** Получить список друзей (GET /friends) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getFriends(): Promise<FriendUser[]> {
        return apiClient('/friends', { method: 'GET' });
    }

    /** Получить входящие и исходящие запросы на дружбу (GET /friends/requests) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getFriendRequests(): Promise<FriendRequestsResponse> {
        return apiClient('/friends/requests', { method: 'GET' });
    }

    /** Отправить запрос на дружбу (POST /friends/request) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async sendFriendRequest(data: SendFriendRequestDTO): Promise<SendFriendRequestResponse> {
        return apiClient('/friends/request', { method: 'POST' }, data);
    }

    /** Принять запрос на дружбу (POST /friends/accept/{requestId}) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async acceptFriendRequest(requestId: number): Promise<AcceptFriendRequestResponse> {
        return apiClient(`/friends/accept/${requestId}`, { method: 'POST' });
    }

    /** Удалить друга или отклонить запрос (DELETE /friends/{id}) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async removeFriend(id: number): Promise<RemoveFriendResponse> {
        return apiClient(`/friends/${id}`, { method: 'DELETE' });
    }

    /** Заблокировать пользователя (POST /friends/block/{targetUserId}) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async blockUser(targetUserId: number): Promise<BlockUserResponse> {
        return apiClient(`/friends/block/${targetUserId}`, { method: 'POST' });
    }

    /** Получить список заблокированных пользователей (GET /friends/blocked) */
    // eslint-disable-next-line require-await -- Returns promise directly
    async getBlockedUsers(): Promise<FriendUser[]> {
        return apiClient('/friends/blocked', { method: 'GET' });
    }
}

export const friendsService = new FriendsService();
