// Messaging Feature - Публичный API
// Экспорт всех компонентов, хуков, сервисов и типов для сообщений

// Components
export { default as MessageList } from './components/MessageList';
export { default as MessageInput } from './components/MessageInput';
export { default as MessageItem } from './components/MessageItem';

// Store
export { default as MessageStore } from './store/messageStore';

// Services
export { default as MessageService } from './services/messageService';

// Types
export * from './types/message';
