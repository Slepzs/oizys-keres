import type { GameState } from '../types/state';
import type { ItemId } from '../types/items';
import type { GachaPackDefinition, GachaPackId, ShopOffer, ShopOfferId } from '../types/shop';
import type { ResourceId } from '../types/resources';
import type { FishingRodId } from '../types/skills';
import { DEFAULT_BAG_SIZE, ITEM_DEFINITIONS } from '../data/items.data';
import { GACHA_PACKS } from '../data/gacha.data';
import { SHOP_OFFERS } from '../data/shop.data';
import { addItemToBag, expandBag, hasSpaceForItem } from './bag';
import { advanceSeed, createRng } from './rng';
import { addMultiplier } from './multipliers';

export const MAX_BAG_TABS = 12;

export interface OpenedShopPack {
  packId: GachaPackId;
  itemsPerPack: number;
  rolls: ItemId[];
}

export interface BuyShopOfferResult {
  success: boolean;
  error?: string;
  state: GameState;
  openedPacks?: OpenedShopPack[];
  purchase?: {
    offerId: ShopOfferId;
    quantity: number;
    totalCostCoins: number;
  };
}

/**
 * Returns true if a forge upgrade has already been purchased (multiplier already active).
 */
export function isForgeUpgradePurchased(state: GameState, multiplierId: string): boolean {
  return state.multipliers.active.some((m) => m.id === multiplierId);
}

export function isFishingRodPurchased(state: Pick<GameState, 'fishingGear'>, rodId: FishingRodId): boolean {
  return state.fishingGear.ownedRodIds.includes(rodId);
}

/**
 * Returns the resource amounts the player has for all costs in a resource-priced offer.
 */
export function getResourceCostAffordability(
  state: GameState,
  offerId: ShopOfferId
): { canAfford: boolean; costs: Array<{ resourceId: ResourceId; required: number; available: number }> } {
  const offer = getShopOffer(offerId);
  if (!offer || offer.pricing.kind !== 'resource') {
    return { canAfford: false, costs: [] };
  }

  const costs = offer.pricing.costs.map((cost) => ({
    resourceId: cost.resourceId,
    required: cost.amount,
    available: state.resources[cost.resourceId]?.amount ?? 0,
  }));

  const canAfford = costs.every((c) => c.available >= c.required);
  return { canAfford, costs };
}

export function getShopOffer(offerId: ShopOfferId): ShopOffer | null {
  return SHOP_OFFERS[offerId] ?? null;
}

export function getBagTabCount(maxSlots: number, tabSize: number = DEFAULT_BAG_SIZE): number {
  if (tabSize <= 0) return 1;
  return Math.max(1, Math.ceil(maxSlots / tabSize));
}

export function getShopOfferUnitPriceCoinsFromBagSlots(bagMaxSlots: number, offerId: ShopOfferId): number {
  const offer = getShopOffer(offerId);
  if (!offer) return Infinity;

  const pricing = offer.pricing;
  if (pricing.kind === 'resource') return Infinity;

  if (pricing.kind === 'fixed') {
    return pricing.amount;
  }

  if (pricing.kind === 'exponential') {
    if (pricing.basedOn === 'bag_extra_tabs') {
      const tabCount = getBagTabCount(bagMaxSlots, DEFAULT_BAG_SIZE);
      const extraTabs = Math.max(0, tabCount - 1);
      const amount = pricing.baseAmount * Math.pow(pricing.multiplier, extraTabs);
      return Math.floor(amount);
    }
  }

  return Infinity;
}

export function getShopOfferUnitPriceCoins(state: GameState, offerId: ShopOfferId): number {
  return getShopOfferUnitPriceCoinsFromBagSlots(state.bag.maxSlots, offerId);
}

export function getShopOfferTotalPriceCoins(
  state: GameState,
  offerId: ShopOfferId,
  quantity: number
): number {
  const q = Math.max(1, Math.floor(quantity));
  const unit = getShopOfferUnitPriceCoins(state, offerId);
  return unit * q;
}

interface RollFromPackResult {
  itemId: ItemId;
  nextSeed: number;
}

function rollFromPack(pack: GachaPackDefinition, seed: number): RollFromPackResult | null {
  const validDrops = pack.drops.filter((drop) => {
    return drop.weight > 0 && ITEM_DEFINITIONS[drop.itemId] !== undefined;
  });

  if (validDrops.length === 0) {
    return null;
  }

  const totalWeight = validDrops.reduce((sum, drop) => sum + drop.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const nextSeed = advanceSeed(seed) || 1;
  const rng = createRng(nextSeed);
  const roll = rng() * totalWeight;

  let cumulativeWeight = 0;
  for (const drop of validDrops) {
    cumulativeWeight += drop.weight;
    if (roll < cumulativeWeight) {
      return { itemId: drop.itemId, nextSeed };
    }
  }

  const fallbackDrop = validDrops[validDrops.length - 1];
  return { itemId: fallbackDrop.itemId, nextSeed };
}

interface OpenPacksResult {
  success: boolean;
  bag: GameState['bag'];
  openedPacks: OpenedShopPack[];
  nextSeed: number;
  error?: string;
}

function openGachaPacks(
  bag: GameState['bag'],
  pack: GachaPackDefinition,
  quantity: number,
  seed: number
): OpenPacksResult {
  let workingBag = bag;
  let workingSeed = seed;
  const openedPacks: OpenedShopPack[] = [];

  for (let packIndex = 0; packIndex < quantity; packIndex++) {
    const rolls: ItemId[] = [];

    for (let itemIndex = 0; itemIndex < pack.itemsPerPack; itemIndex++) {
      const rollResult = rollFromPack(pack, workingSeed);
      if (!rollResult) {
        return {
          success: false,
          bag,
          openedPacks: [],
          nextSeed: seed,
          error: 'Pack drop table is invalid',
        };
      }

      workingSeed = rollResult.nextSeed;
      rolls.push(rollResult.itemId);

      const bagResult = addItemToBag(workingBag, rollResult.itemId, 1);
      if (bagResult.overflow > 0) {
        return {
          success: false,
          bag,
          openedPacks: [],
          nextSeed: seed,
          error: 'Not enough bag space',
        };
      }

      workingBag = bagResult.bag;
    }

    openedPacks.push({
      packId: pack.id,
      itemsPerPack: pack.itemsPerPack,
      rolls,
    });
  }

  return {
    success: true,
    bag: workingBag,
    openedPacks,
    nextSeed: workingSeed,
  };
}

export function buyShopOffer(state: GameState, offerId: ShopOfferId, quantity: number): BuyShopOfferResult {
  const offer = getShopOffer(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found', state };
  }

  const q = Math.max(1, Math.floor(quantity));

  if (offer.effect.kind === 'unlock_fishing_rod' && q !== 1) {
    return { success: false, error: 'Fishing rods can only be purchased one at a time', state };
  }

  if (offer.effect.kind === 'unlock_fishing_rod' && isFishingRodPurchased(state, offer.effect.rodId)) {
    return { success: false, error: 'Fishing rod already owned', state };
  }

  // Handle resource-priced offers differently from coin-priced ones
  if (offer.pricing.kind === 'resource') {
    return buyResourcePricedOffer(state, offer, q);
  }

  const totalCostCoins = getShopOfferTotalPriceCoins(state, offerId, q);

  if (!Number.isFinite(totalCostCoins) || totalCostCoins <= 0) {
    return { success: false, error: 'Invalid price', state };
  }

  if (state.player.coins < totalCostCoins) {
    return { success: false, error: 'Not enough gold', state };
  }

  let newState: GameState = {
    ...state,
    player: {
      ...state.player,
      coins: state.player.coins - totalCostCoins,
    },
  };
  let openedPacks: OpenedShopPack[] | undefined;

  switch (offer.effect.kind) {
    case 'grant_item': {
      const totalQuantity = offer.effect.quantity * q;
      if (!hasSpaceForItem(newState.bag, offer.effect.itemId, totalQuantity)) {
        return { success: false, error: 'Not enough bag space', state };
      }
      const result = addItemToBag(newState.bag, offer.effect.itemId, totalQuantity);
      if (result.overflow > 0) {
        return { success: false, error: 'Not enough bag space', state };
      }
      newState = {
        ...newState,
        bag: result.bag,
      };
      break;
    }

    case 'bag_tab': {
      const tabsToAdd = offer.effect.tabs * q;
      const currentTabs = getBagTabCount(newState.bag.maxSlots, DEFAULT_BAG_SIZE);
      if (currentTabs + tabsToAdd > MAX_BAG_TABS) {
        return { success: false, error: 'Max bag tabs reached', state };
      }

      const additionalSlots = tabsToAdd * DEFAULT_BAG_SIZE;
      const expanded = expandBag(newState.bag, additionalSlots);
      const newTabCount = getBagTabCount(expanded.maxSlots, DEFAULT_BAG_SIZE);
      newState = {
        ...newState,
        bag: expanded,
        bagSettings: {
          ...newState.bagSettings,
          activeTabIndex: Math.max(0, newTabCount - 1),
        },
      };
      break;
    }

    case 'open_gacha_pack': {
      const pack = GACHA_PACKS[offer.effect.packId];
      if (!pack) {
        return { success: false, error: 'Pack not found', state };
      }

      const opened = openGachaPacks(newState.bag, pack, q, newState.rngSeed);
      if (!opened.success) {
        return { success: false, error: opened.error ?? 'Pack opening failed', state };
      }

      openedPacks = opened.openedPacks;
      newState = {
        ...newState,
        bag: opened.bag,
        rngSeed: opened.nextSeed,
      };
      break;
    }

    case 'grant_multiplier':
      // Not reachable for coin-priced offers, handled in buyResourcePricedOffer
      return { success: false, error: 'Invalid offer configuration', state };

    case 'unlock_fishing_rod': {
      newState = {
        ...newState,
        fishingGear: {
          ...newState.fishingGear,
          ownedRodIds: [...newState.fishingGear.ownedRodIds, offer.effect.rodId],
        },
      };
      break;
    }
  }

  return {
    success: true,
    state: newState,
    openedPacks,
    purchase: {
      offerId,
      quantity: q,
      totalCostCoins,
    },
  };
}

function buyResourcePricedOffer(
  state: GameState,
  offer: ShopOffer,
  quantity: number
): BuyShopOfferResult {
  if (offer.pricing.kind !== 'resource') {
    return { success: false, error: 'Unexpected pricing kind', state };
  }

  // Forge upgrades are one-time purchases
  if (offer.effect.kind === 'grant_multiplier') {
    if (isForgeUpgradePurchased(state, offer.effect.multiplierId)) {
      return { success: false, error: 'Already purchased', state };
    }
  }

  // Verify resource costs
  for (const cost of offer.pricing.costs) {
    const available = state.resources[cost.resourceId]?.amount ?? 0;
    const required = cost.amount * quantity;
    if (available < required) {
      return { success: false, error: `Not enough ${cost.resourceId.replace('_', ' ')}`, state };
    }
  }

  // Deduct resources
  let newResources = { ...state.resources };
  for (const cost of offer.pricing.costs) {
    const required = cost.amount * quantity;
    newResources = {
      ...newResources,
      [cost.resourceId]: {
        ...newResources[cost.resourceId],
        amount: (newResources[cost.resourceId]?.amount ?? 0) - required,
      },
    };
  }

  let newState: GameState = { ...state, resources: newResources };

  // Apply effect
  if (offer.effect.kind === 'grant_multiplier') {
    newState = addMultiplier(newState, {
      id: offer.effect.multiplierId,
      source: 'upgrade',
      target: offer.effect.target,
      type: offer.effect.multiplierType,
      value: offer.effect.value,
    });
  }

  return {
    success: true,
    state: newState,
    purchase: {
      offerId: offer.id,
      quantity,
      totalCostCoins: 0,
    },
  };
}
