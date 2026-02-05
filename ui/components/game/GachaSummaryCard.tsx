import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ITEM_DEFINITIONS } from '@/game/data';
import { getShopOfferUnitPriceCoinsFromBagSlots } from '@/game/logic';
import { useGameStore } from '@/store';
import { formatNumber } from '@/utils/format';
import type { ItemId } from '@/game/types/items';

interface RollSummaryEntry {
  itemId: ItemId;
  quantity: number;
}

export function GachaSummaryCard() {
  const [lastOpenedRolls, setLastOpenedRolls] = useState<ItemId[] | null>(null);

  const { coins, bagMaxSlots } = useGameStore(
    useShallow((state) => ({
      coins: state.player.coins,
      bagMaxSlots: state.bag.maxSlots,
    }))
  );
  const buyShopOffer = useGameStore((state) => state.buyShopOffer);

  const packPrice = useMemo(() => {
    return getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots, 'supply_mystery_pack');
  }, [bagMaxSlots]);

  const lastRollSummary = useMemo<RollSummaryEntry[]>(() => {
    if (!lastOpenedRolls) {
      return [];
    }

    const counts = new Map<ItemId, number>();
    for (const itemId of lastOpenedRolls) {
      counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([itemId, quantity]) => ({ itemId, quantity }));
  }, [lastOpenedRolls]);

  const canAfford = coins >= packPrice;

  const handleOpenPack = () => {
    const result = buyShopOffer('supply_mystery_pack', 1);
    if (!result.success) {
      Alert.alert('Pack purchase failed', result.error ?? 'Unknown error');
      return;
    }

    const openedPack = result.openedPacks?.[0];
    if (!openedPack) {
      return;
    }

    setLastOpenedRolls(openedPack.rolls);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🎲 Shopkeeper Packs</Text>
        <Text style={styles.price}>
          {'\u{1FA99}'} {formatNumber(packPrice)}
        </Text>
      </View>

      <Text style={styles.description}>
        Open 1 Prospector Pack for 5 items. Drop rate: 80% Rock, 20% weapon upgrades.
      </Text>

      <Button
        title="Open 1 Pack"
        onPress={handleOpenPack}
        disabled={!canAfford}
        style={styles.button}
      />

      {!canAfford && (
        <Text style={styles.hint}>Earn more gold to buy a pack from the shopkeeper.</Text>
      )}

      {lastRollSummary.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Last Pack</Text>
          {lastRollSummary.map(({ itemId, quantity }) => {
            const item = ITEM_DEFINITIONS[itemId];
            return (
              <Text key={itemId} style={styles.resultLine}>
                {item?.icon ?? '•'} {item?.name ?? itemId} x{quantity}
              </Text>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.warning,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  button: {
    minWidth: 140,
    alignSelf: 'flex-start',
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  results: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  resultsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  resultLine: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
