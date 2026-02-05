import type { GameState } from '../types/state';
import type { ItemId } from '../types/items';
import type { GachaPackDefinition, GachaPackId, ShopOffer, ShopOfferId } from '../types/shop';
import { DEFAULT_BAG_SIZE, ITEM_DEFINITIONS } from '../data/items.data';
import { GACHA_PACKS } from '../data/gacha.data';
import { SHOP_OFFERS } from '../data/shop.data';
import { addItemToBag, expandBag, hasSpaceForItem } from './bag';
import { advanceSeed, createRng } from './rng';

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
  if (pricing.currency !== 'coins') return Infinity;

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
