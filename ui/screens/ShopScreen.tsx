import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { DEFAULT_BAG_SIZE, ITEM_DEFINITIONS, SHOP_OFFER_IDS, SHOP_OFFERS } from '@/game/data';
import { getBagTabCount, getShopOfferUnitPriceCoinsFromBagSlots, MAX_BAG_TABS } from '@/game/logic';
import { useGameActions, useGameStore } from '@/store';
import { formatNumber } from '@/utils/format';
import type { ShopOfferId } from '@/game/types/shop';
import type { ItemId } from '@/game/types/items';

function summarizePackRolls(rolls: ItemId[]): string {
  const counts = new Map<ItemId, number>();

  for (const itemId of rolls) {
    counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([itemId, quantity]) => {
      const item = ITEM_DEFINITIONS[itemId];
      return `${item?.icon ?? ''} ${item?.name ?? itemId} x${quantity}`.trim();
    })
    .join('\n');
}

export function ShopScreen() {
  const { coins, bagMaxSlots } = useGameStore(
    useShallow((state) => ({
      coins: state.player.coins,
      bagMaxSlots: state.bag.maxSlots,
    }))
  );

  const { buyShopOffer } = useGameActions();

  const { premiumOffers, normalOffers } = useMemo(() => {
    const offers = SHOP_OFFER_IDS.map((id) => SHOP_OFFERS[id]);
    return {
      premiumOffers: offers.filter((o) => o.tier === 'premium'),
      normalOffers: offers.filter((o) => o.tier === 'normal'),
    };
  }, []);

  const tabSize = DEFAULT_BAG_SIZE;
  const tabCount = useMemo(() => getBagTabCount(bagMaxSlots, tabSize), [bagMaxSlots, tabSize]);
  const extraTabs = Math.max(0, tabCount - 1);

  const handleBuy = (offerId: ShopOfferId) => {
    const result = buyShopOffer(offerId, 1);
    if (!result.success) {
      Alert.alert('Purchase failed', result.error ?? 'Unknown error');
      return;
    }

    if (result.openedPacks && result.openedPacks.length > 0) {
      const firstPack = result.openedPacks[0];
      Alert.alert('Pack opened', summarizePackRolls(firstPack.rolls));
    }
  };

  return (
    <SafeContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Shopkeeper</Text>
          <Text style={styles.subtitle}>Spend gold for gear and upgrades</Text>
        </View>
        <View style={styles.goldPill}>
          <Text style={styles.goldText}>
            {'\u{1FA99}'} {formatNumber(coins)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Premium</Text>
        <Text style={styles.sectionSubtitle}>
          Upgrades that expand long-term progression
        </Text>

        {premiumOffers.map((offer) => {
          const price = getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots, offer.id);
          const canAfford = coins >= price;
          const premiumDetails =
            offer.id === 'premium_bag_tab'
              ? `Tabs: ${tabCount}/${MAX_BAG_TABS} (owned extra: ${extraTabs})`
              : undefined;

          return (
            <Card key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerIcon}>{offer.icon}</Text>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerName}>{offer.name}</Text>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                  {premiumDetails && (
                    <Text style={styles.offerMeta}>{premiumDetails}</Text>
                  )}
                </View>
              </View>

              <View style={styles.offerFooter}>
                <Text style={styles.priceText}>
                  {'\u{1FA99}'} {formatNumber(price)}
                </Text>
                <Button
                  title="Buy"
                  onPress={() => handleBuy(offer.id)}
                  disabled={!canAfford}
                  style={styles.buyButton}
                />
              </View>
            </Card>
          );
        })}

        <Text style={styles.sectionTitle}>Supplies</Text>
        <Text style={styles.sectionSubtitle}>Simple tools and starter gear</Text>

        {normalOffers.map((offer) => {
          const price = getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots, offer.id);
          const canAfford = coins >= price;

          return (
            <Card key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerIcon}>{offer.icon}</Text>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerName}>{offer.name}</Text>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                  {offer.effect.kind === 'open_gacha_pack' && (
                    <Text style={styles.offerMeta}>Contains 5 item pulls</Text>
                  )}
                </View>
              </View>

              <View style={styles.offerFooter}>
                <Text style={styles.priceText}>
                  {'\u{1FA99}'} {formatNumber(price)}
                </Text>
                <Button
                  title="Buy"
                  onPress={() => handleBuy(offer.id)}
                  disabled={!canAfford}
                  style={styles.buyButton}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  backText: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goldPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  goldText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  offerCard: {
    marginBottom: spacing.sm,
  },
  offerHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  offerIcon: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  offerInfo: {
    flex: 1,
  },
  offerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  offerDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  offerMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  priceText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  buyButton: {
    minWidth: 96,
  },
});
