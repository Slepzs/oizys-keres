import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeContainer } from '../components/layout/SafeContainer';
import { BagGrid } from '../components/game/BagGrid';
import { BagItemDetailsSheet } from '../components/game/BagItemDetailsSheet';
import { useBag, useBagSettings, useGameActions, useGameStore } from '@/store/gameStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { getUsedSlotCount } from '@/game/logic';
import { formatNumber } from '@/utils/format';
import type { SortMode } from '@/game/types';
import { DEFAULT_BAG_SIZE } from '@/game/data';

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
  const { sortBag, consolidateBag, toggleAutoSort, setSortMode, setActiveBagTab } = useGameActions();
  const coins = useGameStore((state) => state.player.coins);
  const insets = useSafeAreaInsets();
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailsHeight, setDetailsHeight] = useState(0);

  const usedSlots = getUsedSlotCount(bag);
  const isEmpty = usedSlots === 0;

  const tabSize = DEFAULT_BAG_SIZE;
  const tabCount = useMemo(() => Math.max(1, Math.ceil(bag.maxSlots / tabSize)), [bag.maxSlots, tabSize]);
  const activeTabIndex = Math.max(0, Math.min(bagSettings.activeTabIndex, tabCount - 1));
  const slotOffset = activeTabIndex * tabSize;

  useEffect(() => {
    if (activeTabIndex !== bagSettings.activeTabIndex) {
      setActiveBagTab(activeTabIndex);
    }
  }, [activeTabIndex, bagSettings.activeTabIndex, setActiveBagTab]);

  const handleSort = (mode: SortMode) => {
    sortBag(mode);
    setSortMode(mode);
    setShowSortModal(false);
  };

  return (
    <SafeContainer padTop={false} padBottom={false} style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(detailsHeight, insets.bottom + spacing.md) + spacing.lg,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bag</Text>
          <View style={styles.headerRight}>
            <Text style={styles.slotCount}>
              {usedSlots}/{bag.maxSlots} slots
            </Text>
            <Text style={styles.coins}>
              {'\u{1FA99}'} {formatNumber(coins)}
            </Text>
          </View>
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

        {/* Tabs */}
        {tabCount > 1 && (
          <View style={styles.tabsRow}>
            {Array.from({ length: tabCount }, (_, i) => i).map((tabIndex) => {
              const isActive = tabIndex === activeTabIndex;
              return (
                <Pressable
                  key={tabIndex}
                  style={({ pressed }) => [
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    pressed && styles.tabButtonPressed,
                  ]}
                  onPress={() => setActiveBagTab(tabIndex)}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    Tab {tabIndex + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎒</Text>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptyText}>
              Train skills to find rare items and crafted goods!
            </Text>
          </View>
        ) : (
          <BagGrid bag={bag} slotOffset={slotOffset} slotCount={tabSize} />
        )}
      </ScrollView>

      {/* Sticky Item Details */}
      {selectedSlot && selectedIndex !== null && (
        <View
          style={[
            styles.stickyDetails,
            {
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height;
            if (next !== detailsHeight) {
              setDetailsHeight(next);
            }
          }}
        >
          <BagItemDetailsSheet
            slotIndex={selectedIndex}
            slot={selectedSlot}
            onClose={() => setSelectedIndex(null)}
          />
        </View>
      )}

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
  safe: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
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
  coins: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.text,
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
  stickyDetails: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
});
