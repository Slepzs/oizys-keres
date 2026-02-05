import type { GameState, CraftingRecipeId } from '@/game/types';
import { craftRecipe as craftRecipeLogic } from '@/game/logic';
import { eventBus } from '@/game/systems';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface CraftingSlice {
  craftRecipe: (
    recipeId: CraftingRecipeId,
    quantity?: number
  ) => { success: boolean; crafted: number; error?: string };
}

export function createCraftingSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): CraftingSlice {
  return {
    craftRecipe: (recipeId: CraftingRecipeId, quantity: number = 1) => {
      const now = Date.now();
      const state = get();
      const gameState: GameState = helpers.getGameStateSnapshot(state);
      const result = craftRecipeLogic(gameState, recipeId, quantity);

      if (!result.success) {
        if (result.error) {
          get().addNotification('system', 'Crafting Failed', result.error, { icon: '⚠️' });
        }

        return { success: false, crafted: 0, error: result.error ?? 'Crafting failed' };
      }

      const finalState = eventBus.dispatch(result.events, result.state, helpers.getGameContext(now));

      let nextState: GameState = {
        ...finalState,
        notifications: get().notifications,
        timestamps: {
          ...finalState.timestamps,
          lastActive: now,
        },
      };

      nextState = helpers.maybeAutoSave(nextState, now);

      set({
        player: nextState.player,
        skills: nextState.skills,
        attributes: nextState.attributes,
        skillStats: nextState.skillStats,
        resources: nextState.resources,
        bag: nextState.bag,
        bagSettings: nextState.bagSettings,
        quests: nextState.quests,
        achievements: nextState.achievements,
        multipliers: nextState.multipliers,
        crafting: nextState.crafting,
        combat: nextState.combat,
        timestamps: nextState.timestamps,
        activeSkill: nextState.activeSkill,
        rngSeed: nextState.rngSeed,
      });

      const recipeName = result.recipe?.name ?? 'Item';
      const icon = result.recipe?.fallbackIcon ?? '🔨';
      get().addNotification(
        'system',
        'Craft Complete',
        `${recipeName} x${result.crafted}`,
        { icon }
      );

      return { success: true, crafted: result.crafted };
    },
  };
}
