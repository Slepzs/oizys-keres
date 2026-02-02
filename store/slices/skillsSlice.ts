import type { SkillId } from '@/game/types';
import { WOODCUTTING_TREES } from '@/game/data';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface SkillsSlice {
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  setActiveTree: (treeId: string) => void;
}

export function createSkillsSlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): SkillsSlice {
  return {
    setActiveSkill: (skillId: SkillId | null) => {
      set({ activeSkill: skillId });
    },

    toggleAutomation: (skillId: SkillId) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill || !skill.automationUnlocked) {
        return;
      }
      set({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            automationEnabled: !skill.automationEnabled,
          },
        },
      });
    },

    setActiveTree: (treeId: string) => {
      const state = get();
      const woodcuttingSkill = state.skills.woodcutting;
      const tree = WOODCUTTING_TREES[treeId];

      if (!tree || woodcuttingSkill.level < tree.levelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          woodcutting: {
            ...woodcuttingSkill,
            activeTreeId: treeId,
          },
        },
      });
    },
  };
}

