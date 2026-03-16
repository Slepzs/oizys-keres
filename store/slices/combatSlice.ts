import type { EquipmentSlot, ItemId, TrainingMode } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { isFood } from '@/game/types/items';
import { removeItemFromBag } from '@/game/logic/bag';
import {
  getPlayerAttackSpeed,
  getSummoningCombatBonuses,
  equipItem as equipItemLogic,
  fleeCombat as fleeCombatLogic,
  selectEnemyForZone as selectEnemyForZoneLogic,
  selectZone as selectZoneLogic,
  setTrainingMode as setTrainingModeLogic,
  startCombat as startCombatLogic,
  toggleAutoFight as toggleAutoFightLogic,
  toggleAutoEat as toggleAutoEatLogic,
  setAutoEatThreshold as setAutoEatThresholdLogic,
  unequipSlot as unequipSlotLogic,
} from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface CombatSlice {
  startCombat: (zoneId: string) => void;
  fleeCombat: () => void;
  setTrainingMode: (mode: TrainingMode) => void;
  toggleAutoFight: () => void;
  toggleAutoEat: () => void;
  setAutoEatThreshold: (threshold: number) => void;
  equipItem: (itemId: ItemId) => { unequippedItemId: ItemId | null; success: boolean };
  unequipSlot: (slot: EquipmentSlot) => { unequippedItemId: ItemId | null };
  selectZone: (zoneId: string | null) => void;
  selectEnemyForZone: (zoneId: string, enemyId: string) => void;
  eatFood: (itemId: ItemId) => void;
}

export function createCombatSlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): CombatSlice {
  return {
    startCombat: (zoneId: string) => {
      const state = get();
      const now = Date.now();
      const petBonuses = getSummoningCombatBonuses(state.summoning, state.skills.summoning.level);
      const attackSpeed = getPlayerAttackSpeed(state.combat, petBonuses);
      const newCombat = startCombatLogic(state.combat, zoneId, now, attackSpeed);
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

    toggleAutoEat: () => {
      const state = get();
      const newCombat = toggleAutoEatLogic(state.combat);
      set({ combat: newCombat });
    },

    setAutoEatThreshold: (threshold: number) => {
      const state = get();
      const newCombat = setAutoEatThresholdLogic(state.combat, threshold);
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

    selectEnemyForZone: (zoneId: string, enemyId: string) => {
      const state = get();
      const newCombat = selectEnemyForZoneLogic(state.combat, zoneId, enemyId);
      set({ combat: newCombat });
    },

    eatFood: (itemId: ItemId) => {
      const state = get();
      const itemDef = ITEM_DEFINITIONS[itemId];
      if (!itemDef || !isFood(itemDef)) {
        return;
      }
      const bagResult = removeItemFromBag(state.bag, itemId, 1);
      if (bagResult.removed < 1) {
        return;
      }
      const currentHp = state.combat.playerCurrentHp;
      const maxHp = state.combat.playerMaxHp;
      if (currentHp >= maxHp) {
        return;
      }
      const newHp = Math.min(maxHp, currentHp + itemDef.healAmount);
      set({
        bag: bagResult.bag,
        combat: {
          ...state.combat,
          playerCurrentHp: newHp,
        },
      });
    },
  };
}
