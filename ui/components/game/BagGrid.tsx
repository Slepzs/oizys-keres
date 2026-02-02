import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { BagSlot } from './BagSlot';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { BagState, ItemRarity } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { useGameActions } from '@/store/gameStore';
import { isEquipment } from '@/game/types';

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
  const { discardSlot, toggleSlotLock, addItem, removeItem, equipItem } = useGameActions();

  const selectedSlot = selectedIndex !== null ? bag.slots[selectedIndex] : null;
  const selectedItem = selectedSlot ? ITEM_DEFINITIONS[selectedSlot.itemId] : null;

  const handleSlotPress = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
    }
  };

  const handleDiscard = () => {
    if (selectedIndex === null || !selectedSlot) return;

    if (selectedSlot.locked) {
      Alert.alert('Locked', 'Unlock this slot before discarding.');
      return;
    }

    Alert.alert(
      'Discard Item',
      `Are you sure you want to discard ${selectedSlot.quantity}x ${selectedItem?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discardSlot(selectedIndex);
            setSelectedIndex(null);
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

    // Remove item from bag first
    removeItem(itemId, 1);

    // Equip the item (this returns any previously equipped item)
    const result = equipItem(itemId);

    // If there was an item already equipped, add it back to bag
    if (result.unequippedItemId) {
      addItem(result.unequippedItemId, 1);
    }

    setSelectedIndex(null);
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

          {/* Equipment Stats */}
          {isEquipment(selectedItem) && (
            <View style={styles.equipmentStats}>
              <Text style={styles.equipmentSlotLabel}>Slot: {selectedItem.slot}</Text>
              {selectedItem.stats.attackBonus > 0 && (
                <Text style={styles.statText}>Attack: +{selectedItem.stats.attackBonus}</Text>
              )}
              {selectedItem.stats.strengthBonus > 0 && (
                <Text style={styles.statText}>Strength: +{selectedItem.stats.strengthBonus}</Text>
              )}
              {selectedItem.stats.defenseBonus > 0 && (
                <Text style={styles.statText}>Defense: +{selectedItem.stats.defenseBonus}</Text>
              )}
              {selectedItem.stats.attackSpeed && (
                <Text style={styles.statText}>Speed: {selectedItem.stats.attackSpeed}s</Text>
              )}
              {selectedItem.levelRequired && (
                <Text style={styles.levelRequired}>Requires Combat Level {selectedItem.levelRequired}</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {isEquipment(selectedItem) && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.equipButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleEquip}
              >
                <Text style={[styles.actionButtonText, styles.equipButtonText]}>Equip</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                selectedSlot.locked && styles.actionButtonActive,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleToggleLock}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  selectedSlot.locked && styles.actionButtonTextActive,
                ]}
              >
                {selectedSlot.locked ? 'Unlock' : 'Lock'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.discardButton,
                selectedSlot.locked && styles.actionButtonDisabled,
                pressed && !selectedSlot.locked && styles.actionButtonPressed,
              ]}
              onPress={handleDiscard}
              disabled={selectedSlot.locked}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.discardButtonText,
                  selectedSlot.locked && styles.actionButtonTextDisabled,
                ]}
              >
                Discard
              </Text>
            </Pressable>
          </View>
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
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.text,
  },
  actionButtonTextDisabled: {
    color: colors.textMuted,
  },
  discardButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  discardButtonText: {
    color: colors.error,
  },
  equipmentStats: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  equipmentSlotLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  levelRequired: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  equipButton: {
    backgroundColor: colors.primary,
  },
  equipButtonText: {
    color: colors.text,
  },
});
