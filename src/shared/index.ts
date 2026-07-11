/**
 * Shared - Общие компоненты, хуки и утилиты
 * Экспорт переиспользуемых элементов для всех модулей
 */

// Components
export { default as Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export { default as ClickableAvatar } from './components/ClickableAvatar';
export { default as BlockedAccountModal } from './components/BlockedAccountModal';
export { default as BlockedServerModal } from './components/BlockedServerModal';
export { default as UserProfileModal } from './components/UserProfileModal';
export { UserProfileProvider } from './components/UserProfileProvider';
export { default as ProfileDemo } from './components/ProfileDemo';
export { default as Spinner } from './components/spinner/Spinner';
export { default as ToastNotifications } from './components/toastNotifications/ToastNotifications';

// Hooks
export { useUserProfile } from './hooks/useUserProfile';
export { useUserProfileModal } from './hooks/useUserProfileModal';

// Contexts
export { UserProfileContext } from './contexts/UserProfileContext';
export type { UserProfileContextType } from './contexts/UserProfileContext';
