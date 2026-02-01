import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { BagGrid } from '../components/game/BagGrid';
import { useBag, useBagSettings, useGameActions } from '@/store/gameStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { getUsedSlotCount } from '@/game/logic';
import type { SortMode } from '@/game/types';

const SORT_MODE_LABELS: Record<SortMode, string> = {
  rarity: 'Rarity',
  category: 'Category',
  quantity: 'Quantity',
  name: 'Name',
};

const SORT_MODES: SortMode[] = ['rarity', 'category', 'quantity', 'name'];

export function BagScreen() {
  const bag = useBag();
  const bagSettings = useBagSettings();
  const { sortBag, consolidateBag, toggleAutoSort, setSortMode } = useGameActions();
  const [showSortModal, setShowSortModal] = useState(false);

  const usedSlots = getUsedSlotCount(bag);
  const isEmpty = usedSlots === 0;

  const handleSort = (mode: SortMode) => {
    sortBag(mode);
    setSortMode(mode);
    setShowSortModal(false);
  };

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Bag</Text>
          <Text style={styles.slotCount}>
            {usedSlots}/{bag.maxSlots} slots
          </Text>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          {/* Sort Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.actionButtonText}>Sort</Text>
          </Pressable>

          {/* Quick-Stack Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={consolidateBag}
          >
            <Text style={styles.actionButtonText}>Stack</Text>
          </Pressable>

          {/* Auto-Sort Toggle */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              bagSettings.autoSort && styles.actionButtonActive,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={toggleAutoSort}
          >
            <Text
              style={[
                styles.actionButtonText,
                bagSettings.autoSort && styles.actionButtonTextActive,
              ]}
            >
              Auto
            </Text>
          </Pressable>
        </View>

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎒</Text>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptyText}>
              Train skills to find rare items and crafted goods!
            </Text>
          </View>
        ) : (
          <BagGrid bag={bag} />
        )}
      </ScrollView>

      {/* Sort Mode Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_MODES.map((mode) => (
              <Pressable
                key={mode}
                style={({ pressed }) => [
                  styles.modalOption,
                  bagSettings.sortMode === mode && styles.modalOptionActive,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={() => handleSort(mode)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    bagSettings.sortMode === mode && styles.modalOptionTextActive,
                  ]}
                >
                  {SORT_MODE_LABELS[mode]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  slotCount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minWidth: 200,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  modalOptionActive: {
    backgroundColor: colors.surfaceLight,
  },
  modalOptionPressed: {
    opacity: 0.7,
  },
  modalOptionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
