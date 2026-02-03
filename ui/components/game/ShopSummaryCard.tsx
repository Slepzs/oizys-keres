import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { DEFAULT_BAG_SIZE } from '@/game/data';
import { getBagTabCount, getShopOfferUnitPriceCoinsFromBagSlots, MAX_BAG_TABS } from '@/game/logic';
import { useGameStore } from '@/store';
import { formatNumber } from '@/utils/format';

export function ShopSummaryCard() {
  const router = useRouter();

  const { coins, bagMaxSlots } = useGameStore(
    useShallow((state) => ({
      coins: state.player.coins,
      bagMaxSlots: state.bag.maxSlots,
    }))
  );

  const { tabCount, nextTabPrice } = useMemo(() => {
    const tabs = getBagTabCount(bagMaxSlots, DEFAULT_BAG_SIZE);
    const price = getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots, 'premium_bag_tab');
    return { tabCount: tabs, nextTabPrice: price };
  }, [bagMaxSlots]);

  const canBuyTab = coins >= nextTabPrice && tabCount < MAX_BAG_TABS;

  const handlePress = () => {
    router.push('/shop');
  };

  return (
    <Pressable onPress={handlePress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>🧑‍💼</Text>
            <Text style={styles.title}>Shopkeeper</Text>
          </View>
          <Text style={styles.chevron}>{'\u2192'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {tabCount}/{MAX_BAG_TABS}
            </Text>
            <Text style={styles.statLabel}>Bag Tabs</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, canBuyTab && styles.statValueHighlight]}>
              {'\u{1FA99}'} {formatNumber(nextTabPrice)}
            </Text>
            <Text style={styles.statLabel}>Next Tab</Text>
          </View>
        </View>

        <Text style={[styles.statusText, canBuyTab && styles.statusHighlight]}>
          {tabCount >= MAX_BAG_TABS ? 'Max tabs reached' : canBuyTab ? 'You can afford a premium tab' : 'Upgrade your bag with premium permits'}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statValueHighlight: {
    color: colors.success,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusHighlight: {
    color: colors.success,
    fontWeight: fontWeight.semibold,
  },
});

