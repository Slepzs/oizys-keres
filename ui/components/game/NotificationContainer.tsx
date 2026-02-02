import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore, useNotifications } from '@/store/gameStore';
import { getDisplayNotifications } from '@/game/logic';
import { MAX_NOTIFICATIONS_QUEUE } from '@/game/types';
import { NotificationToast } from './NotificationToast';
import { spacing } from '@/constants/theme';

export function NotificationContainer() {
  const notifications = useNotifications();
  const removeNotification = useGameStore((state) => state.removeNotification);

  const handleDismiss = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // Get notifications to display (limited and sorted)
  const now = Date.now();
  const displayNotifications = getDisplayNotifications(
    notifications,
    MAX_NOTIFICATIONS_QUEUE,
    now
  );

  if (displayNotifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {displayNotifications.map((notification, index) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl + 20, // Account for status bar + some padding
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});
