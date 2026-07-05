/**
 * Типы для модуля друзей
 */

/** Статус дружбы */
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

/** Модель дружбы (соответствует Friendship в API бэкенда) */
export interface Friendship {
    id: number;
    userId: number;
    friendId: number;
    status: FriendshipStatus;
    createdAt: string;
    updatedAt: string;
}

/** DTO для отправки запроса на дружбу */
export interface SendFriendRequestDTO {
    friendId: number;
}

/** Друг с данными пользователя */
export interface FriendWithUser extends Friendship {
    friend?: {
        id: number;
        username: string;
        profilePicture?: string;
        status?: string;
    };
}
