/**
 * Public API feature profile-settings
 */

// UI
export { default as ProfileSettings } from './ui/ProfileSettings';
export { default as ProfileInfoSection } from './ui/ProfileInfoSection';
export { default as SecuritySection } from './ui/SecuritySection';
export { ProfileSettingsContext } from './ui/ProfileSettingsContext';
export { useProfileSettingsDeps } from './ui/ProfileSettingsContext';

// Model
export { useProfileSettings } from './model/useProfileSettings';
export type { IProfileSettingsService, INotificationService, I18nService, ProfileSettingsDeps } from './model/ports';
export type { ProfileForm, PasswordForm, ValidationErrors, UseProfileSettingsReturn } from './model/types';

// API (адаптеры)
export { ProfileSettingsApi } from './api/ProfileSettingsApi';
export { NotificationAdapter } from './api/NotificationAdapter';
