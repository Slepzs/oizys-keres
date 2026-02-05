import React from 'react';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useCombatTracker } from '@/store';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';

function CombatProgressStrip() {
  const tracker = useCombatTracker();

  if (!tracker) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.strip}>
      <View style={styles.labelsRow}>
        <Text style={styles.labelText}>
          You {tracker.playerCurrentHp}/{tracker.playerMaxHp}
        </Text>
        <Text style={styles.labelText}>
          {tracker.enemyIcon} {tracker.enemyCurrentHp}/{tracker.enemyMaxHp}
        </Text>
      </View>

      <View style={styles.barsRow}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.max(0, Math.min(1, tracker.playerProgress)) * 100}%`,
                backgroundColor: colors.healthBar,
              },
            ]}
          />
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.max(0, Math.min(1, tracker.enemyProgress)) * 100}%`,
                backgroundColor: colors.error,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function CombatTabBar(props: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <BottomTabBar {...props} />
      <CombatProgressStrip />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  strip: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: '100%',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceLight,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  barsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
