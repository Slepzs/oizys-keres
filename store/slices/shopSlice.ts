import type { GameState } from '@/game/types';
import type { ShopOfferId } from '@/game/types/shop';
import type { ItemId } from '@/game/types/items';
import { ITEM_DEFINITIONS, SHOP_OFFERS } from '@/game/data';
import { buyShopOffer as buyShopOfferLogic, type OpenedShopPack } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface ShopSlice {
  buyShopOffer: (offerId: ShopOfferId, quantity?: number) => { success: boolean; error?: string; openedPacks?: OpenedShopPack[] };
}

function summarizePackRolls(rolls: ItemId[]): string {
  const counts = new Map<ItemId, number>();

  for (const itemId of rolls) {
    counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([itemId, quantity]) => {
      const item = ITEM_DEFINITIONS[itemId];
      if (!item) {
        return `${itemId} x${quantity}`;
      }

      return `${item.icon} ${item.name} x${quantity}`;
    })
    .join(', ');
}

export function createShopSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): ShopSlice {
  return {
    buyShopOffer: (offerId: ShopOfferId, quantity: number = 1) => {
      const state = get();
      const gameState: GameState = helpers.getGameStateSnapshot(state);
      const result = buyShopOfferLogic(gameState, offerId, quantity);

      if (!result.success) {
        return { success: false, error: result.error ?? 'Purchase failed' };
      }

      set({
        player: result.state.player,
        bag: result.state.bag,
        bagSettings: result.state.bagSettings,
        rngSeed: result.state.rngSeed,
      });

      const offer = SHOP_OFFERS[offerId];
      if (result.openedPacks && result.openedPacks.length > 0) {
        const firstPack = result.openedPacks[0];
        const extraPacks = result.openedPacks.length - 1;
        const rollsSummary = summarizePackRolls(firstPack.rolls);
        const extraLabel = extraPacks > 0 ? ` (+${extraPacks} more packs)` : '';

        get().addNotification('system', 'Pack Opened', `${rollsSummary}${extraLabel}`, {
          icon: offer?.icon ?? '🎁',
          duration: 5500,
        });
      } else {
        get().addNotification(
          'system',
          'Purchased',
          `${offer?.name ?? 'Purchase'} for ${result.purchase?.totalCostCoins ?? 0} gold`,
          { icon: offer?.icon ?? '🧾' }
        );
      }

      return { success: true, openedPacks: result.openedPacks };
    },
  };
}
