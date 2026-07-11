/**
 * Адаптер NotificationAdapter - реализация INotificationService.
 * Делегирует в существующий notificationStore из core.
 */

import { notificationStore } from '../../../core';
import type { INotificationService } from '../model/ports';

export class NotificationAdapter implements INotificationService {
    notify(message: string, type: 'success' | 'error' | 'info'): void {
        notificationStore.addNotification(message, type);
    }
}
