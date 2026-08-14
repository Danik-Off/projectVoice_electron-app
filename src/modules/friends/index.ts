/**
 * Friends Module - публичный API
 */
export { friendsModule } from './module';
export { friendsService } from './services/friendsService';
export type {
    FriendshipStatus,
    FriendUser,
    FriendRequestEntry,
    FriendRequestsResponse,
    SendFriendRequestDTO,
    SendFriendRequestResponse,
    AcceptFriendRequestResponse,
    RemoveFriendResponse,
    BlockUserResponse
} from './types/friendship';
