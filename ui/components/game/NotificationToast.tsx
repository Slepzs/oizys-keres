import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { Notification, NotificationType } from '@/game/types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import { getNotificationProgress } from '@/game/logic';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}

const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  quest: {
    bg: 'rgba(74, 158, 255, 0.15)',
    border: colors.primary,
    icon: colors.primary,
  },
  achievement: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: colors.warning,
    icon: colors.warning,
  },
  skill_level_up: {
    bg: 'rgba(74, 222, 128, 0.15)',
    border: colors.success,
    icon: colors.success,
  },
  player_level_up: {
    bg: 'rgba(168, 85, 247, 0.15)',
    border: colors.rarityEpic,
    icon: colors.rarityEpic,
  },
  combat: {
    bg: 'rgba(248, 113, 113, 0.15)',
    border: colors.error,
    icon: colors.error,
  },
};

const TYPE_ICONS: Record<NotificationType, string> = {
  quest: '📜',
  achievement: '🏆',
  skill_level_up: '⭐',
  player_level_up: '🌟',
  combat: '⚔️',
};

export function NotificationToast({ notification, onDismiss, index }: NotificationToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const [progress, setProgress] = useState(1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

  const colors = NOTIFICATION_COLORS[notification.type];
  const icon = notification.icon ?? TYPE_ICONS[notification.type];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]).start();

    startTimeRef.current = Date.now();

    // Progress animation
    const updateProgress = () => {
      const now = Date.now();
      const currentProgress = getNotificationProgress(notification, now);
      setProgress(currentProgress);

      if (currentProgress > 0) {
        animationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);

  const handleDismiss = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(notification.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [
            { translateY },
            { scale },
          ],
          opacity,
          marginTop: index === 0 ? 0 : spacing.sm,
        },
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.pressable}>
        <View style={styles.content}>
          <Text style={[styles.icon, { color: colors.icon }]}>{icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.border }]}>
              {notification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.border,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pressable: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  icon: {
    fontSize: fontSize.xl,
    width: 32,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
  },
});
