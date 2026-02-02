import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/constants/theme';
import type { EquipmentSlot as EquipmentSlotType } from '@/game/types';
import type { ItemId } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';

const SLOT_ICONS: Record<EquipmentSlotType, string> = {
  weapon: '🗡️',
  helmet: '🪖',
  chest: '🦺',
  legs: '🩳',
  boots: '👢',
  accessory: '💍',
};

const SLOT_LABELS: Record<EquipmentSlotType, string> = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
  accessory: 'Accessory',
};

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  equippedItemId: string | null;
  onPress?: () => void;
}

export function EquipmentSlot({ slot, equippedItemId, onPress }: EquipmentSlotProps) {
  const item = equippedItemId ? ITEM_DEFINITIONS[equippedItemId as ItemId] : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        item && styles.equipped,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{item?.icon ?? SLOT_ICONS[slot]}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {item?.name ?? SLOT_LABELS[slot]}
      </Text>
      {!item && <Text style={styles.emptyText}>Empty</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equipped: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
