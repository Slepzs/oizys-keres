import type { PetId } from '@/game/types';
import { calculateMaxHp, getSummoningCombatBonuses } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface SummoningSlice {
  setActivePet: (petId: PetId | null) => void;
}

export function createSummoningSlice(
  set: SliceSet,
  get: SliceGet,
  _helpers: StoreHelpers
): SummoningSlice {
  return {
    setActivePet: (petId: PetId | null) => {
      const state = get();
      if (petId && !state.summoning.pets[petId]?.unlocked) {
        return;
      }

      const nextSummoning = {
        ...state.summoning,
        activePetId: petId,
      };
      const bonuses = getSummoningCombatBonuses(nextSummoning, state.skills.summoning.level);
      const playerMaxHp = calculateMaxHp(state.combat.combatSkills, bonuses.maxHpBonus);

      set({
        summoning: nextSummoning,
        combat: {
          ...state.combat,
          playerMaxHp,
          playerCurrentHp: Math.min(state.combat.playerCurrentHp, playerMaxHp),
        },
      });
    },
  };
}
