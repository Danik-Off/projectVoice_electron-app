/**
 * Admin Module - публичный API
 */
export { adminModule } from './module';
export { adminService } from './services/adminService';
export type {
    AdminStats,
    UserFilters,
    ServerFilters,
    User,
    Server,
    UsersResponse,
    ServersResponse,
    LogsResponse,
    BlockServerRequest,
    UpdateUserRequest
} from './services/adminService';
