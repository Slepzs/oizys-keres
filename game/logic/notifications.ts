import type { Notification, NotificationType, NotificationsState } from '../types/notifications';
import {
  NOTIFICATION_DURATIONS,
  NOTIFICATION_PRIORITIES,
  MAX_NOTIFICATIONS_QUEUE,
} from '../types/notifications';

export interface CreateNotificationInput {
  id: string;
  now: number;
  type: NotificationType;
  title: string;
  message: string;
  options?: {
    icon?: string;
    duration?: number;
    priority?: Notification['priority'];
  };
}

/**
 * Create a new notification.
 */
export function createNotification(input: CreateNotificationInput): Notification {
  const { id, now, type, title, message, options } = input;
  return {
    id,
    type,
    title,
    message,
    timestamp: now,
    duration: options?.duration ?? NOTIFICATION_DURATIONS[type],
    icon: options?.icon,
    priority: options?.priority ?? NOTIFICATION_PRIORITIES[type],
  };
}

/**
 * Add a notification to the state.
 * Enforces max queue limit by removing oldest low priority notifications first.
 */
export function addNotification(
  state: NotificationsState,
  notification: Notification
): NotificationsState {
  // If at queue limit, remove oldest low priority notification
  if (state.items.length >= MAX_NOTIFICATIONS_QUEUE) {
    const oldestLowIndex = state.items.findIndex((n) => n.priority === 'low');
    if (oldestLowIndex !== -1) {
      const filtered = [...state.items];
      filtered.splice(oldestLowIndex, 1);
      return { items: [...filtered, notification] };
    }
    // If no low priority, remove oldest normal
    const oldestNormalIndex = state.items.findIndex((n) => n.priority === 'normal');
    if (oldestNormalIndex !== -1) {
      const filtered = [...state.items];
      filtered.splice(oldestNormalIndex, 1);
      return { items: [...filtered, notification] };
    }
    // Last resort: remove oldest
    return { items: [...state.items.slice(1), notification] };
  }

  return { items: [...state.items, notification] };
}

/**
 * Remove a notification by ID.
 */
export function removeNotification(
  state: NotificationsState,
  id: string
): NotificationsState {
  return {
    items: state.items.filter((n) => n.id !== id),
  };
}

/**
 * Clear all notifications.
 */
export function clearNotifications(state: NotificationsState): NotificationsState {
  return { items: [] };
}

/**
 * Clear expired notifications based on current time.
 */
export function clearExpiredNotifications(
  state: NotificationsState,
  now: number
): NotificationsState {
  return {
    items: state.items.filter((n) => now - n.timestamp < n.duration),
  };
}

/**
 * Get notifications that should be displayed (not expired, limited to max display).
 */
export function getDisplayNotifications(
  state: NotificationsState,
  maxDisplay: number = 4,
  now: number
): Notification[] {
  const active = state.items.filter((n) => now - n.timestamp < n.duration);
  // Sort by priority (high first) then by timestamp (newest first)
  const sorted = active.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.timestamp - a.timestamp;
  });
  return sorted.slice(0, maxDisplay);
}

/**
 * Get remaining time for a notification in milliseconds.
 */
export function getRemainingTime(notification: Notification, now: number): number {
  const elapsed = now - notification.timestamp;
  return Math.max(0, notification.duration - elapsed);
}

/**
 * Get progress percentage (0-1) for a notification.
 */
export function getNotificationProgress(
  notification: Notification,
  now: number
): number {
  const elapsed = now - notification.timestamp;
  return Math.max(0, Math.min(1, 1 - elapsed / notification.duration));
}
