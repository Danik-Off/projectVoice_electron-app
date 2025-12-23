/**
 * Shared - Общие компоненты, хуки и утилиты
 * Экспорт переиспользуемых элементов для всех модулей
 */

// Components
export { default as Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export { default as ClickableAvatar } from './components/ClickableAvatar';

// Hooks
export { default as useUserProfileModal } from './hooks/useUserProfileModal';

// Utils
export * from './utils/cookie';
