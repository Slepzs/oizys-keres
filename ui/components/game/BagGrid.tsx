import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { BagSlot, SLOT_SIZE } from './BagSlot';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { BagState, ItemRarity } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { useGameActions } from '@/store/gameStore';
import { isEquipment } from '@/game/types';

interface BagGridProps {
  bag: BagState;
  slotOffset?: number;
  slotCount?: number;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: colors.rarityCommon,
  uncommon: colors.rarityUncommon,
  rare: colors.rarityRare,
  epic: colors.rarityEpic,
};

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
};

export function BagGrid({ bag, slotOffset = 0, slotCount, selectedIndex, onSelectIndex }: BagGridProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const { discardSlot, toggleSlotLock, addItem, removeItem, equipItem } = useGameActions();

  const clampedOffset = Math.max(0, Math.min(slotOffset, bag.slots.length));
  const effectiveSlotCount = Math.max(
    0,
    Math.min(slotCount ?? bag.slots.length, bag.slots.length - clampedOffset)
  );

  const visibleSlots = useMemo(() => {
    const end = clampedOffset + effectiveSlotCount;
    return bag.slots.slice(clampedOffset, end);
  }, [bag.slots, clampedOffset, effectiveSlotCount]);

  useEffect(() => {
    onSelectIndex(null);
  }, [clampedOffset, effectiveSlotCount]);

  const selectedSlot = selectedIndex !== null ? bag.slots[selectedIndex] : null;
  const selectedItem = selectedSlot ? ITEM_DEFINITIONS[selectedSlot.itemId] : null;

  const handleSlotPress = (index: number) => {
    onSelectIndex(selectedIndex === index ? null : index);
  };

  const columns = useMemo(() => {
    const slotOuterSize = SLOT_SIZE + spacing.xs * 2;
    const possible = gridWidth > 0 ? Math.floor(gridWidth / slotOuterSize) : 4;
    if (possible >= 6) return 6;
    if (possible >= 5) return 5;
    return 4;
  }, [gridWidth]);

  const handleDiscard = () => {
    if (selectedIndex === null || !selectedSlot || !selectedItem) return;

    Alert.alert(
      'Discard Item',
      `Are you sure you want to discard ${selectedSlot.quantity}x ${selectedItem.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discardSlot(selectedIndex);
            onSelectIndex(null);
          },
        },
      ]
    );
  };

  const handleToggleLock = () => {
    if (selectedIndex === null) return;
    toggleSlotLock(selectedIndex);
  };

  const handleEquip = () => {
    if (selectedIndex === null || !selectedSlot) return;

    const itemId = selectedSlot.itemId;
    const itemDef = ITEM_DEFINITIONS[itemId];

    if (!isEquipment(itemDef)) return;

    // Try to equip first
    const result = equipItem(itemId);

    // If equip failed, don't remove from bag
    if (!result.success) {
      return;
    }

    // Equip succeeded - remove from bag
    removeItem(itemId, 1);

    // If there was an item already equipped, add it back to bag
    if (result.unequippedItemId) {
      addItem(result.unequippedItemId, 1);
    }

    onSelectIndex(null);
  };

  // Render slots in a grid based on calculated columns
  const rows: (typeof visibleSlots)[] = [];
  for (let i = 0; i < visibleSlots.length; i += columns) {
    rows.push(visibleSlots.slice(i, i + columns));
  }

  return (
    <View style={styles.container}>
      <View
        style={styles.grid}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          if (width !== gridWidth) {
            setGridWidth(width);
          }
        }}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((slot, colIndex) => {
              const index = clampedOffset + rowIndex * columns + colIndex;
              return (
                <BagSlot
                  key={index}
                  slot={slot}
                  isSelected={selectedIndex === index}
                  onPress={() => handleSlotPress(index)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

