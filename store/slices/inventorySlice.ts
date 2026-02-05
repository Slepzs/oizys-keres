import type { ItemId, SortMode } from '@/game/types';
import {
  addItemToBag,
  removeItemFromBag,
  sortBag,
  consolidateStacks,
  expandBag,
  toggleSlotLock,
  discardSlot,
  sellItemFromSlot,
  sellAllSellableItems,
} from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface InventorySlice {
  addItem: (itemId: ItemId, quantity: number) => { added: number; overflow: number };
  removeItem: (itemId: ItemId, quantity: number) => { removed: number; remaining: number };
  discardSlot: (slotIndex: number) => void;
  sellSlot: (slotIndex: number, quantity: number) => { sold: number; coinsEarned: number; success: boolean; error?: string };
  sellAll: () => { sold: number; slotsSold: number; coinsEarned: number; success: boolean; error?: string };
  sortBag: (mode: SortMode) => void;
  consolidateBag: () => void;
  toggleAutoSort: () => void;
  setSortMode: (mode: SortMode) => void;
  setActiveBagTab: (tabIndex: number) => void;
  toggleSlotLock: (slotIndex: number) => void;
  expandBag: (additionalSlots: number) => void;
}

export function createInventorySlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): InventorySlice {
  return {
    addItem: (itemId: ItemId, quantity: number) => {
      const state = get();
      const result = addItemToBag(state.bag, itemId, quantity);
      set({ bag: result.bag });
      return { added: result.added, overflow: result.overflow };
    },

    removeItem: (itemId: ItemId, quantity: number) => {
      const state = get();
      const result = removeItemFromBag(state.bag, itemId, quantity);
      set({ bag: result.bag });
      return { removed: result.removed, remaining: result.remaining };
    },

    discardSlot: (slotIndex: number) => {
      const state = get();
      const newBag = discardSlot(state.bag, slotIndex);
      set({ bag: newBag });
    },

    sellSlot: (slotIndex: number, quantity: number) => {
      const state = get();
      const result = sellItemFromSlot(state.bag, slotIndex, quantity);

      if (!result.success) {
        return { sold: 0, coinsEarned: 0, success: false, error: result.error };
      }

      set({
        bag: result.bag,
        player: {
          ...state.player,
          coins: state.player.coins + result.coinsEarned,
        },
      });

      return { sold: result.sold, coinsEarned: result.coinsEarned, success: true };
    },

    sellAll: () => {
      const state = get();
      const result = sellAllSellableItems(state.bag);

      if (result.itemsSold <= 0) {
        return { sold: 0, slotsSold: 0, coinsEarned: 0, success: false, error: 'No sellable items' };
      }

      set({
        bag: result.bag,
        player: {
          ...state.player,
          coins: state.player.coins + result.coinsEarned,
        },
      });

      return {
        sold: result.itemsSold,
        slotsSold: result.slotsSold,
        coinsEarned: result.coinsEarned,
        success: true,
      };
    },

    sortBag: (mode: SortMode) => {
      const state = get();
      const newBag = sortBag(state.bag, mode);
      set({ bag: newBag });
    },

    consolidateBag: () => {
      const state = get();
      const newBag = consolidateStacks(state.bag);
      set({ bag: newBag });
    },

    toggleAutoSort: () => {
      const state = get();
      set({
        bagSettings: {
          ...state.bagSettings,
          autoSort: !state.bagSettings.autoSort,
        },
      });
    },

    setSortMode: (mode: SortMode) => {
      const state = get();
      set({
        bagSettings: {
          ...state.bagSettings,
          sortMode: mode,
        },
      });
    },

    setActiveBagTab: (tabIndex: number) => {
      const state = get();
      set({
        bagSettings: {
          ...state.bagSettings,
          activeTabIndex: Math.max(0, Math.floor(tabIndex)),
        },
      });
    },

    toggleSlotLock: (slotIndex: number) => {
      const state = get();
      const newBag = toggleSlotLock(state.bag, slotIndex);
      set({ bag: newBag });
    },

    expandBag: (additionalSlots: number) => {
      const state = get();
      const newBag = expandBag(state.bag, additionalSlots);
      set({ bag: newBag });
    },
  };
}
