import type { GameState } from '@/game/types';
import type { ShopOfferId } from '@/game/types/shop';
import { SHOP_OFFERS } from '@/game/data';
import { buyShopOffer as buyShopOfferLogic, type OpenedShopPack } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface ShopSlice {
  buyShopOffer: (offerId: ShopOfferId, quantity?: number) => { success: boolean; error?: string; openedPacks?: OpenedShopPack[] };
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
        const openedCount = result.openedPacks.length;
        const readyMessage =
          openedCount > 1
            ? `${openedCount} packs are ready to reveal.`
            : 'Pack is ready to reveal.';

        get().addNotification('system', 'Pack Opened', readyMessage, {
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
