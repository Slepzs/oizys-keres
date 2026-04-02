import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PackRevealModal } from '../components/game/PackRevealModal';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { DEFAULT_BAG_SIZE, FISHING_RODS, RESOURCE_DEFINITIONS, SHOP_OFFER_IDS, SHOP_OFFERS } from '@/game/data';
import {
  getBagTabCount,
  getResourceCostAffordability,
  getShopOfferUnitPriceCoinsFromBagSlots,
  isFishingRodPurchased,
  isForgeUpgradePurchased,
  MAX_BAG_TABS,
} from '@/game/logic';
import { useGameActions, useGameStore } from '@/store';
import { formatNumber } from '@/utils/format';
import type { ShopOfferId } from '@/game/types/shop';
import type { ItemId } from '@/game/types/items';

export function ShopScreen() {
  const [revealingPack, setRevealingPack] = useState<{ packName: string; rolls: ItemId[] } | null>(null);
  const { coins, bagMaxSlots, resources, multipliers, fishingGear } = useGameStore(
    useShallow((state) => ({
      coins: state.player.coins,
      bagMaxSlots: state.bag.maxSlots,
      resources: state.resources,
      multipliers: state.multipliers,
      fishingGear: state.fishingGear,
    }))
  );

  const { buyShopOffer } = useGameActions();

  const { premiumOffers, normalOffers, forgeOffers, fishingOffers } = useMemo(() => {
    const offers = SHOP_OFFER_IDS.map((id) => SHOP_OFFERS[id]);
    return {
      premiumOffers: offers.filter((o) => o.tier === 'premium'),
      normalOffers: offers.filter((o) => o.tier === 'normal'),
      forgeOffers: offers.filter((o) => o.tier === 'forge'),
      fishingOffers: offers.filter((o) => o.tier === 'fishing'),
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
      setRevealingPack({
        packName: SHOP_OFFERS[offerId]?.name ?? 'Pack',
        rolls: firstPack.rolls,
      });
    }
  };

  // Minimal state snapshot for forge affordability checks (only resources/multipliers needed)
  const forgeCheckState = useMemo(() => ({ resources, multipliers }) as any, [resources, multipliers]);

  return (
    <SafeContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Shopkeeper</Text>
          <Text style={styles.subtitle}>Spend gold or ores for permanent upgrades</Text>
        </View>
        <View style={styles.goldPill}>
          <Text style={styles.goldText}>
            {'\u{1FA99}'} {formatNumber(coins)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ore Exchange / Forge Upgrades */}
        <Text style={styles.sectionTitle}>Ore Exchange</Text>
        <Text style={styles.sectionSubtitle}>
          Smelt rare ores into permanent XP sigils. One-time purchases.
        </Text>

        {forgeOffers.map((offer) => {
          if (offer.pricing.kind !== 'resource') return null;
          if (offer.effect.kind !== 'grant_multiplier') return null;

          const isPurchased = isForgeUpgradePurchased(forgeCheckState, offer.effect.multiplierId);
          const { canAfford, costs } = getResourceCostAffordability(forgeCheckState, offer.id);
          const bonusPct = Math.round(offer.effect.value * 100);

          const cardStyle = isPurchased
            ? { ...styles.offerCard, ...styles.purchasedCard }
            : styles.offerCard;

          return (
            <Card
              key={offer.id}
              style={cardStyle}
            >
              <View style={styles.offerHeader}>
                <Text style={styles.offerIcon}>{offer.icon}</Text>
                <View style={styles.offerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.offerName}>{offer.name}</Text>
                    {isPurchased && (
                      <Text style={styles.purchasedBadge}>✓ Owned</Text>
                    )}
                  </View>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                  <Text style={styles.forgeBonusTag}>+{bonusPct}% permanent XP bonus</Text>
                </View>
              </View>

              {/* Resource cost breakdown */}
              <View style={styles.costRow}>
                {costs.map((c) => {
                  const def = RESOURCE_DEFINITIONS[c.resourceId];
                  const met = c.available >= c.required;
                  return (
                    <View key={c.resourceId} style={styles.costItem}>
                      <Text style={styles.costIcon}>{def?.icon ?? '📦'}</Text>
                      <Text style={[styles.costText, met ? styles.costMet : styles.costShort]}>
                        {formatNumber(c.available)}/{formatNumber(c.required)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.offerFooter}>
                <View />
                <Button
                  title={isPurchased ? 'Purchased' : 'Forge'}
                  onPress={() => handleBuy(offer.id)}
                  disabled={isPurchased || !canAfford}
                  style={isPurchased ? { ...styles.buyButton, ...styles.purchasedButton } : styles.buyButton}
                />
              </View>
            </Card>
          );
        })}

        {/* Premium */}
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

        <Text style={styles.sectionTitle}>Fishing Gear</Text>
        <Text style={styles.sectionSubtitle}>Permanent rod unlocks for higher-tier waters</Text>

        {fishingOffers.map((offer) => {
          if (offer.effect.kind !== 'unlock_fishing_rod') return null;

          const price = getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots, offer.id);
          const canAfford = coins >= price;
          const isOwned = isFishingRodPurchased({ fishingGear }, offer.effect.rodId);
          const rod = FISHING_RODS[offer.effect.rodId];

          return (
            <Card
              key={offer.id}
              style={isOwned ? { ...styles.offerCard, ...styles.purchasedCard } : styles.offerCard}
            >
              <View style={styles.offerHeader}>
                <Text style={styles.offerIcon}>{offer.icon}</Text>
                <View style={styles.offerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.offerName}>{offer.name}</Text>
                    {isOwned && <Text style={styles.purchasedBadge}>✓ Owned</Text>}
                  </View>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                  <Text style={styles.offerMeta}>
                    Unlocks: {rod.unlocksSpots.map((spotId) => spotId.replace(/_/g, ' ')).join(', ')}
                  </Text>
                </View>
              </View>

              <View style={styles.offerFooter}>
                <Text style={styles.priceText}>
                  {'\u{1FA99}'} {formatNumber(price)}
                </Text>
                <Button
                  title={isOwned ? 'Owned' : 'Buy'}
                  onPress={() => handleBuy(offer.id)}
                  disabled={isOwned || !canAfford}
                  style={isOwned ? { ...styles.buyButton, ...styles.purchasedButton } : styles.buyButton}
                />
              </View>
            </Card>
          );
        })}

        {/* Supplies */}
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
                    <Text style={styles.offerMeta}>Swipe to reveal 5 pulls</Text>
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

      <PackRevealModal
        visible={revealingPack !== null}
        packName={revealingPack?.packName ?? 'Pack'}
        rolls={revealingPack?.rolls ?? []}
        onClose={() => setRevealingPack(null)}
      />
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
  purchasedCard: {
    borderWidth: 1,
    borderColor: colors.success ?? '#4caf50',
    opacity: 0.85,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  offerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  purchasedBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  offerDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  forgeBonusTag: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#a78bfa',
    marginTop: spacing.xs,
  },
  costRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  costIcon: {
    fontSize: fontSize.sm,
  },
  costText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  costMet: {
    color: '#4caf50',
  },
  costShort: {
    color: colors.textMuted,
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
  purchasedButton: {
    opacity: 0.5,
  },
});
