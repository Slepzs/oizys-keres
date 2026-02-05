import type { GameState } from '@/game/types';
import type { ShopOfferId } from '@/game/types/shop';
import { buyShopOffer as buyShopOfferLogic } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface ShopSlice {
  buyShopOffer: (offerId: ShopOfferId, quantity?: number) => { success: boolean; error?: string };
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
      });

      const offerName = offerId === 'premium_bag_tab' ? 'Bag Tab Permit' : 'Purchase';
      get().addNotification(
        'system',
        'Purchased',
        `${offerName} for ${result.purchase?.totalCostCoins ?? 0} gold`,
        { icon: '🧾' }
      );

      return { success: true };
    },
  };
}
