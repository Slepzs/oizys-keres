import { createInitialBagState } from '@/game/data/items.data';
import type { ItemId, SkillId, CombatSkillId } from '@/game/types';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface AdminSlice {
  addItemToBag: (itemId: ItemId, quantity: number) => { added: number; overflow: number };
  clearBag: () => void;
  setPlayerLevel: (level: number) => void;
  setPlayerXp: (xp: number) => void;
  setSkillLevel: (skillId: SkillId, level: number) => void;
  setSkillXp: (skillId: SkillId, xp: number) => void;
  unlockSkillAutomation: (skillId: SkillId) => void;
  setCombatSkillXp: (skillId: CombatSkillId, xp: number) => void;
  setPlayerHealth: (current: number, max: number) => void;
  unlockAllAutomation: () => void;
  maxAllSkills: () => void;
}

export function createAdminSlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): AdminSlice {
  return {
    addItemToBag: (itemId: ItemId, quantity: number) => {
      const state = get();
      const { addItem } = state;
      return addItem(itemId, quantity);
    },

    clearBag: () => {
      set({
        bag: createInitialBagState(),
      });
    },

    setPlayerLevel: (level: number) => {
      const state = get();
      set({
        player: {
          ...state.player,
          level: Math.max(1, level),
        },
      });
    },

    setPlayerXp: (xp: number) => {
      const state = get();
      set({
        player: {
          ...state.player,
          xp: Math.max(0, xp),
        },
      });
    },

    setSkillLevel: (skillId: SkillId, level: number) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill) return;

      set({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            level: Math.max(1, level),
          },
        },
      });
    },

    setSkillXp: (skillId: SkillId, xp: number) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill) return;

      set({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            xp: Math.max(0, xp),
          },
        },
      });
    },

    unlockSkillAutomation: (skillId: SkillId) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill) return;

      set({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            automationUnlocked: true,
            automationEnabled: true,
          },
        },
      });
    },

    setCombatSkillXp: (skillId: CombatSkillId, xp: number) => {
      const state = get();
      const validXp = isNaN(xp) ? 0 : Math.max(0, xp);
      set({
        combat: {
          ...state.combat,
          combatSkills: {
            ...state.combat.combatSkills,
            [skillId]: {
              xp: validXp,
            },
          },
        },
      });
    },

    setPlayerHealth: (current: number, max: number) => {
      const state = get();
      set({
        combat: {
          ...state.combat,
          playerCurrentHp: Math.max(1, current),
          playerMaxHp: Math.max(1, max),
        },
      });
    },

    unlockAllAutomation: () => {
      const state = get();
      const skillIds = Object.keys(state.skills) as SkillId[];

      const updatedSkills = { ...state.skills };
      skillIds.forEach((skillId) => {
        updatedSkills[skillId] = {
          ...updatedSkills[skillId],
          automationUnlocked: true,
          automationEnabled: true,
        };
      });

      set({ skills: updatedSkills });
    },

    maxAllSkills: () => {
      const state = get();
      const skillIds = Object.keys(state.skills) as SkillId[];

      const updatedSkills = { ...state.skills };
      skillIds.forEach((skillId) => {
        updatedSkills[skillId] = {
          ...updatedSkills[skillId],
          level: 99,
          xp: 99999999,
          automationUnlocked: true,
          automationEnabled: true,
        };
      });

      set({ skills: updatedSkills });
    },
  };
}
