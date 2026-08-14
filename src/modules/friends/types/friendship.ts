/**
 * Типы для модуля друзей
 *
 * Соответствуют новому NestJS API (http://localhost:5000/api#/Friends):
 * - GET    /friends           — плоский массив пользователей-друзей
 * - GET    /friends/requests  — { incoming: [...], outgoing: [...] }
 * - POST   /friends/request   — { message, request: {...} }
 * - POST   /friends/accept/:id — { message }
 * - DELETE /friends/:id       — { message }
 * - POST   /friends/block/:id — { message }
 * - GET    /friends/blocked   — плоский массив заблокированных пользователей
 */

/** Статус дружбы */
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

/** DTO для отправки запроса на дружбу */
export interface SendFriendRequestDTO {
    friendId: number;
}

/** Пользователь-друг (плоский объект, как в новом API) */
export interface FriendUser {
    id: number;
    username: string;
    profilePicture?: string | null;
    status?: string;
    tag?: string;
}

/** Запрос на дружбу с данными пользователя */
export interface FriendRequestEntry {
    id: number;
    user: FriendUser;
    createdAt: string;
}

/** Ответ GET /friends/requests — входящие и исходящие запросы */
export interface FriendRequestsResponse {
    incoming: FriendRequestEntry[];
    outgoing: FriendRequestEntry[];
}

/** Ответ POST /friends/request */
export interface SendFriendRequestResponse {
    message: string;
    request: {
        id: number;
        userId: number;
        friendId: number;
        status: FriendshipStatus;
    };
}

/** Ответ POST /friends/accept/:requestId */
export interface AcceptFriendRequestResponse {
    message: string;
}

/** Ответ DELETE /friends/:id */
export interface RemoveFriendResponse {
    message: string;
}

/** Ответ POST /friends/block/:targetUserId */
export interface BlockUserResponse {
    message: string;
}
