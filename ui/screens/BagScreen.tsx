import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { BagGrid } from '../components/game/BagGrid';
import { useBag } from '@/store/gameStore';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { getUsedSlotCount } from '@/game/logic';

export function BagScreen() {
  const bag = useBag();
  const usedSlots = getUsedSlotCount(bag);
  const isEmpty = usedSlots === 0;

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Bag</Text>
          <Text style={styles.slotCount}>
            {usedSlots}/{bag.maxSlots} slots
          </Text>
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
});
