import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BagSlot } from './BagSlot';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { BagState, ItemRarity } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';

interface BagGridProps {
  bag: BagState;
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

export function BagGrid({ bag }: BagGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedSlot = selectedIndex !== null ? bag.slots[selectedIndex] : null;
  const selectedItem = selectedSlot ? ITEM_DEFINITIONS[selectedSlot.itemId] : null;

  const handleSlotPress = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
    }
  };

  // Render slots in a 4-column grid
  const rows: (typeof bag.slots)[] = [];
  for (let i = 0; i < bag.slots.length; i += 4) {
    rows.push(bag.slots.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((slot, colIndex) => {
              const index = rowIndex * 4 + colIndex;
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

      {/* Item Details Panel */}
      {selectedItem && selectedSlot && (
        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsIcon}>{selectedItem.icon}</Text>
            <View style={styles.detailsInfo}>
              <Text style={styles.detailsName}>{selectedItem.name}</Text>
              <View style={styles.rarityBadge}>
                <View
                  style={[
                    styles.rarityDot,
                    { backgroundColor: RARITY_COLORS[selectedItem.rarity] },
                  ]}
                />
                <Text
                  style={[
                    styles.rarityText,
                    { color: RARITY_COLORS[selectedItem.rarity] },
                  ]}
                >
                  {RARITY_LABELS[selectedItem.rarity]}
                </Text>
              </View>
            </View>
            <Text style={styles.quantity}>x{selectedSlot.quantity}</Text>
          </View>
          <Text style={styles.description}>{selectedItem.description}</Text>
          <Text style={styles.stackInfo}>
            Stack: {selectedSlot.quantity}/{selectedItem.maxStack}
          </Text>
        </Card>
      )}
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
  detailsCard: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xs,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailsIcon: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  rarityText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  quantity: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  stackInfo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
