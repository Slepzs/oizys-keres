/**
 * Notification types for the toast notification system.
 */

export type NotificationType = 'quest' | 'achievement' | 'skill_level_up' | 'player_level_up' | 'combat';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration: number;
  icon?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface NotificationsState {
  items: Notification[];
}

export const NOTIFICATION_DURATIONS: Record<NotificationType, number> = {
  quest: 6000,
  achievement: 5000,
  skill_level_up: 4000,
  player_level_up: 5000,
  combat: 4000,
};

export const NOTIFICATION_PRIORITIES: Record<NotificationType, Notification['priority']> = {
  quest: 'high',
  achievement: 'high',
  skill_level_up: 'normal',
  player_level_up: 'high',
  combat: 'low',
};

export const MAX_NOTIFICATIONS_DISPLAYED = 4;
export const MAX_NOTIFICATIONS_QUEUE = 10;
