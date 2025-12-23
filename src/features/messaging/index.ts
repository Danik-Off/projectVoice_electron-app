// Messaging Feature - Публичный API
// Экспорт всех компонентов, хуков, сервисов и типов для сообщений

// Components
export { default as MessageList } from './components/MessageList';
export { default as MessageInput } from './components/MessageInput';
export { default as MessageItem } from './components/MessageItem';

// Store
export { messageStore } from './store/messageStore';

// Services
export { messageService } from './services/messageService';

// Types
export * from './types/message';
