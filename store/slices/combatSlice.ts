import type { EquipmentSlot, ItemId, TrainingMode } from '@/game/types';
import {
  equipItem as equipItemLogic,
  fleeCombat as fleeCombatLogic,
  selectZone as selectZoneLogic,
  setTrainingMode as setTrainingModeLogic,
  startCombat as startCombatLogic,
  toggleAutoFight as toggleAutoFightLogic,
  unequipSlot as unequipSlotLogic,
} from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface CombatSlice {
  startCombat: (zoneId: string) => void;
  fleeCombat: () => void;
  setTrainingMode: (mode: TrainingMode) => void;
  toggleAutoFight: () => void;
  equipItem: (itemId: ItemId) => { unequippedItemId: ItemId | null; success: boolean };
  unequipSlot: (slot: EquipmentSlot) => { unequippedItemId: ItemId | null };
  selectZone: (zoneId: string | null) => void;
}

export function createCombatSlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): CombatSlice {
  return {
    startCombat: (zoneId: string) => {
      const state = get();
      const now = Date.now();
      const newCombat = startCombatLogic(state.combat, zoneId, now);
      set({ combat: newCombat });
    },

    fleeCombat: () => {
      const state = get();
      const newCombat = fleeCombatLogic(state.combat);
      set({ combat: newCombat });
    },

    setTrainingMode: (mode: TrainingMode) => {
      const state = get();
      const newCombat = setTrainingModeLogic(state.combat, mode);
      set({ combat: newCombat });
    },

    toggleAutoFight: () => {
      const state = get();
      const newCombat = toggleAutoFightLogic(state.combat);
      set({ combat: newCombat });
    },

    equipItem: (itemId: ItemId) => {
      const state = get();
      const result = equipItemLogic(state.combat, itemId);
      set({ combat: result.state });
      return { unequippedItemId: result.unequippedItemId, success: result.success };
    },

    unequipSlot: (slot: EquipmentSlot) => {
      const state = get();
      const result = unequipSlotLogic(state.combat, slot);
      set({ combat: result.state });
      return { unequippedItemId: result.unequippedItemId };
    },

    selectZone: (zoneId: string | null) => {
      const state = get();
      const newCombat = selectZoneLogic(state.combat, zoneId);
      set({ combat: newCombat });
    },
  };
}

