import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { BagSlot as BagSlotType, ItemRarity } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';

interface BagSlotProps {
  slot: BagSlotType | null;
  isSelected?: boolean;
  onPress?: () => void;
}

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: colors.rarityCommon,
  uncommon: colors.rarityUncommon,
  rare: colors.rarityRare,
  epic: colors.rarityEpic,
};

export function BagSlot({ slot, isSelected, onPress }: BagSlotProps) {
  const definition = slot ? ITEM_DEFINITIONS[slot.itemId] : null;
  const rarityColor = definition ? RARITY_COLORS[definition.rarity] : colors.surfaceLight;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.slot,
        isSelected && styles.selected,
        slot && { borderColor: rarityColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!slot}
    >
      {slot && definition ? (
        <>
          <Text style={styles.icon}>{definition.icon}</Text>
          {slot.quantity > 1 && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{slot.quantity}</Text>
            </View>
          )}
          {slot.locked && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.empty} />
      )}
    </Pressable>
  );
}

const SLOT_SIZE = 60;

const styles = StyleSheet.create({
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
  selected: {
    borderWidth: 3,
    backgroundColor: colors.surfaceLight,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 28,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  lockBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 10,
  },
  empty: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    opacity: 0.3,
  },
});
