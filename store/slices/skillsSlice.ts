import type { CookingRecipeId, FishingSpotId, HerbloreRecipeId, RockTierId, SkillId, TreeTierId } from '@/game/types';
import { WOODCUTTING_TREES, MINING_ROCKS, FISHING_SPOTS, COOKING_RECIPES, HERBLORE_RECIPES } from '@/game/data';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface SkillsSlice {
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  setActiveTree: (treeId: TreeTierId) => void;
  setActiveRock: (rockId: RockTierId) => void;
  setActiveFishingSpot: (spotId: FishingSpotId) => void;
  setActiveCookingRecipe: (recipeId: CookingRecipeId) => void;
  setActiveHerbloreRecipe: (recipeId: HerbloreRecipeId) => void;
}

export function createSkillsSlice(set: SliceSet, get: SliceGet, _helpers: StoreHelpers): SkillsSlice {
  return {
    setActiveSkill: (skillId: SkillId | null) => {
      if (skillId && get().combat.activeCombat) {
        return;
      }
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

    setActiveTree: (treeId: TreeTierId) => {
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

    setActiveRock: (rockId: RockTierId) => {
      const state = get();
      const miningSkill = state.skills.mining;
      const rock = MINING_ROCKS[rockId];

      if (!rock || miningSkill.level < rock.levelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          mining: {
            ...miningSkill,
            activeRockId: rockId,
          },
        },
      });
    },

    setActiveFishingSpot: (spotId: FishingSpotId) => {
      const state = get();
      const fishingSkill = state.skills.fishing;
      const spot = FISHING_SPOTS[spotId];

      if (!spot || fishingSkill.level < spot.levelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          fishing: {
            ...fishingSkill,
            activeFishingSpotId: spotId,
          },
        },
      });
    },

    setActiveCookingRecipe: (recipeId: CookingRecipeId) => {
      const state = get();
      const cookingSkill = state.skills.cooking;
      const recipe = COOKING_RECIPES[recipeId];

      if (!recipe || cookingSkill.level < recipe.cookingLevelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          cooking: {
            ...cookingSkill,
            activeCookingRecipeId: recipeId,
          },
        },
      });
    },

    setActiveHerbloreRecipe: (recipeId: HerbloreRecipeId) => {
      const state = get();
      const herbloreSkill = state.skills.herblore;
      const recipe = HERBLORE_RECIPES[recipeId];

      if (!recipe || herbloreSkill.level < recipe.herbloreLevelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          herblore: {
            ...herbloreSkill,
            activeHerbloreRecipeId: recipeId,
          },
        },
      });
    },
  };
}
