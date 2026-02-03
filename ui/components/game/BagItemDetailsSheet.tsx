import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { BagSlot, ItemRarity } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { isEquipment } from '@/game/types';
import { useGameActions } from '@/store/gameStore';
import { formatNumber } from '@/utils/format';

interface BagItemDetailsSheetProps {
  slotIndex: number;
  slot: BagSlot;
  onClose: () => void;
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

export function BagItemDetailsSheet({ slotIndex, slot, onClose }: BagItemDetailsSheetProps) {
  const { discardSlot, toggleSlotLock, addItem, removeItem, equipItem, sellSlot } = useGameActions();

  const item = ITEM_DEFINITIONS[slot.itemId];
  if (!item) return null;

  const handleDiscard = () => {
    if (slot.locked) {
      Alert.alert('Locked', 'Unlock this slot before discarding.');
      return;
    }

    Alert.alert('Discard Item', `Discard ${slot.quantity}x ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardSlot(slotIndex);
          onClose();
        },
      },
    ]);
  };

  const handleToggleLock = () => {
    toggleSlotLock(slotIndex);
  };

  const handleSell = () => {
    if (slot.locked) {
      Alert.alert('Locked', 'Unlock this slot before selling.');
      return;
    }

    if (item.sellPrice <= 0) {
      Alert.alert('Not Sellable', `${item.name} cannot be sold.`);
      return;
    }

    const total = item.sellPrice * slot.quantity;
    Alert.alert('Sell Item', `Sell ${slot.quantity}x ${item.name} for ${'\u{1FA99}'} ${formatNumber(total)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sell',
        style: 'default',
        onPress: () => {
          const result = sellSlot(slotIndex, slot.quantity);
          if (!result.success) {
            Alert.alert('Could not sell', result.error ?? 'Unknown error');
            return;
          }
          onClose();
        },
      },
    ]);
  };

  const handleEquip = () => {
    if (!isEquipment(item)) return;

    const result = equipItem(item.id);
    if (!result.success) {
      Alert.alert('Cannot Equip', 'You do not meet the requirements to equip this item.');
      return;
    }

    removeItem(item.id, 1);
    if (result.unequippedItemId) {
      addItem(result.unequippedItemId, 1);
    }

    onClose();
  };

  return (
    <Card style={styles.card}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsIcon}>{item.icon}</Text>
        <View style={styles.detailsInfo}>
          <Text style={styles.detailsName}>{item.name}</Text>
          <View style={styles.rarityBadge}>
            <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[item.rarity] }]} />
            <Text style={[styles.rarityText, { color: RARITY_COLORS[item.rarity] }]}>
              {RARITY_LABELS[item.rarity]}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          onPress={onClose}
          hitSlop={8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.stackInfo}>
          Stack: {slot.quantity}/{item.maxStack}
        </Text>
        <Text style={styles.quantity}>x{slot.quantity}</Text>
      </View>

      <Text style={styles.sellInfo}>
        {item.sellPrice > 0
          ? `Sell: ${'\u{1FA99}'} ${formatNumber(item.sellPrice)} each (${'\u{1FA99}'} ${formatNumber(item.sellPrice * slot.quantity)} total)`
          : 'Sell: Not sellable'}
      </Text>

      {isEquipment(item) && (
        <View style={styles.equipmentStats}>
          <Text style={styles.equipmentSlotLabel}>Slot: {item.slot}</Text>
          {item.stats.attackBonus > 0 && (
            <Text style={styles.statText}>Attack: +{item.stats.attackBonus}</Text>
          )}
          {item.stats.strengthBonus > 0 && (
            <Text style={styles.statText}>Strength: +{item.stats.strengthBonus}</Text>
          )}
          {item.stats.defenseBonus > 0 && (
            <Text style={styles.statText}>Defense: +{item.stats.defenseBonus}</Text>
          )}
          {item.stats.attackSpeed && (
            <Text style={styles.statText}>Speed: {item.stats.attackSpeed}s</Text>
          )}
          {item.levelRequired && (
            <Text style={styles.levelRequired}>Requires Combat Level {item.levelRequired}</Text>
          )}
        </View>
      )}

      <View style={styles.actionRow}>
        {isEquipment(item) && (
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
            slot.locked && styles.actionButtonActive,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={handleToggleLock}
        >
          <Text style={[styles.actionButtonText, slot.locked && styles.actionButtonTextActive]}>
            {slot.locked ? 'Unlock' : 'Lock'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.sellButton,
            slot.locked && styles.actionButtonDisabled,
            pressed && !slot.locked && styles.actionButtonPressed,
          ]}
          onPress={handleSell}
          disabled={slot.locked}
        >
          <Text
            style={[
              styles.actionButtonText,
              styles.sellButtonText,
              slot.locked && styles.actionButtonTextDisabled,
            ]}
          >
            Sell
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.discardButton,
            slot.locked && styles.actionButtonDisabled,
            pressed && !slot.locked && styles.actionButtonPressed,
          ]}
          onPress={handleDiscard}
          disabled={slot.locked}
        >
          <Text
            style={[
              styles.actionButtonText,
              styles.discardButtonText,
              slot.locked && styles.actionButtonTextDisabled,
            ]}
          >
            Discard
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  stackInfo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sellInfo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  sellButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.success,
  },
  sellButtonText: {
    color: colors.success,
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

