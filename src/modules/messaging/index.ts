/**
 * Messaging Module - публичный API
 */
export { messagingModule } from './module';

// Re-export from features/messaging
export { default as MessageList } from '../../features/messaging/components/MessageList';
export { default as MessageInput } from '../../features/messaging/components/MessageInput';
export { default as MessageItem } from '../../features/messaging/components/MessageItem';
export { messageStore } from '../../features/messaging/store/messageStore';
export { messageService } from '../../features/messaging/services/messageService';
export * from '../../features/messaging/types/message';

