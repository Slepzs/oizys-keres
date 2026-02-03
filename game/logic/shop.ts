import type { GameState } from '../types/state';
import type { ShopOffer, ShopOfferId } from '../types/shop';
import { DEFAULT_BAG_SIZE } from '../data/items.data';
import { SHOP_OFFERS } from '../data/shop.data';
import { addItemToBag, expandBag, hasSpaceForItem } from './bag';

export const MAX_BAG_TABS = 12;

export interface BuyShopOfferResult {
  success: boolean;
  error?: string;
  state: GameState;
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
  }

  return {
    success: true,
    state: newState,
    purchase: {
      offerId,
      quantity: q,
      totalCostCoins,
    },
  };
}
