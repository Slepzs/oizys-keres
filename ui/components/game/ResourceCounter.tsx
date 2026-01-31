import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { formatNumber } from '@/utils/format';
import type { ResourceId } from '@/game/types';
import { RESOURCE_DEFINITIONS } from '@/game/data';

interface ResourceCounterProps {
  resourceId: ResourceId;
  amount: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceCounter({
  resourceId,
  amount,
  showIcon = true,
  size = 'md',
}: ResourceCounterProps) {
  const definition = RESOURCE_DEFINITIONS[resourceId];

  return (
    <View style={styles.container}>
      {showIcon && (
        <Text style={[styles.icon, styles[`icon_${size}`]]}>
          {definition.icon}
        </Text>
      )}
      <Text style={[styles.amount, styles[`amount_${size}`]]}>
        {formatNumber(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    // Icon sizes
  },
  icon_sm: {
    fontSize: fontSize.md,
  },
  icon_md: {
    fontSize: fontSize.lg,
  },
  icon_lg: {
    fontSize: fontSize.xl,
  },
  amount: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  amount_sm: {
    fontSize: fontSize.sm,
  },
  amount_md: {
    fontSize: fontSize.md,
  },
  amount_lg: {
    fontSize: fontSize.lg,
  },
});
