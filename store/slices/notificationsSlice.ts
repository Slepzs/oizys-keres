import type { NotificationType } from '@/game/types';
import { addNotification, clearNotifications, createNotification, removeNotification } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface NotificationsSlice {
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    options?: { icon?: string; duration?: number }
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export function createNotificationsSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): NotificationsSlice {
  return {
    addNotification: (
      type: NotificationType,
      title: string,
      message: string,
      options?: { icon?: string; duration?: number }
    ) => {
      const state = get();
      const now = Date.now();

      if (!state.isHydrated) {
        return;
      }

      const notification = createNotification({
        id: helpers.nextNotificationId(now),
        now,
        type,
        title,
        message,
        options,
      });

      const newNotifications = addNotification(state.notifications, notification);
      set({ notifications: newNotifications });

      setTimeout(() => {
        const currentState = get();
        const cleared = removeNotification(currentState.notifications, notification.id);
        set({ notifications: cleared });
      }, notification.duration);
    },

    removeNotification: (id: string) => {
      const state = get();
      const newNotifications = removeNotification(state.notifications, id);
      set({ notifications: newNotifications });
    },

    clearNotifications: () => {
      const state = get();
      const newNotifications = clearNotifications(state.notifications);
      set({ notifications: newNotifications });
    },
  };
}

