import { COOKING_RECIPES, getAvailableCookingRecipes, getDefaultCookingRecipe } from '../data/cooking-recipes.data';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import { skillSpeedMultiplier } from '../data/curves';
import type { CookingRecipe } from '../data/cooking-recipes.data';
import type { CookingRecipeId, SkillState } from '../types/skills';
import type { GameState } from '../types/state';
import type { GameEvent } from '../systems/events.types';
import { addItemToBag, isBagFull } from './bag';
import { removeResource } from './resources';
import { addSkillXp, addPlayerXp } from './xp';
import { getSkillXpMultiplier } from './multipliers';

export interface CookingSelectionState {
  level: number;
  activeCookingRecipeId?: CookingRecipeId;
}

export interface CookingTickResult {
  state: GameState;
  events: GameEvent[];
}

export function getActiveCookingRecipe(skill: CookingSelectionState): CookingRecipe {
  const recipeId = skill.activeCookingRecipeId;
  if (recipeId && COOKING_RECIPES[recipeId] && skill.level >= COOKING_RECIPES[recipeId].cookingLevelRequired) {
    return COOKING_RECIPES[recipeId];
  }
  return getDefaultCookingRecipe(skill.level);
}

export function getCookingRecipesForLevel(level: number): CookingRecipe[] {
  return getAvailableCookingRecipes(level);
}

export function setActiveCookingRecipe(skill: SkillState, recipeId: CookingRecipeId): SkillState {
  const recipe = COOKING_RECIPES[recipeId];
  if (!recipe || skill.level < recipe.cookingLevelRequired) {
    return skill;
  }
  return { ...skill, activeCookingRecipeId: recipeId };
}

/**
 * Process cooking automation tick.
 * Called directly from processTick — handles active and automated cooking.
 */
export function processCookingTick(state: GameState, ticksElapsed: number): CookingTickResult {
  const cookingSkill = state.skills.cooking;
  if (!cookingSkill) {
    return { state, events: [] };
  }

  const isActive = state.activeSkill === 'cooking';
  const isAutomated = cookingSkill.automationEnabled && !isActive;

  if (!isActive && !isAutomated) {
    return { state, events: [] };
  }

  const effectiveTicks = isAutomated ? ticksElapsed * 0.5 : ticksElapsed;
  const recipe = getActiveCookingRecipe(cookingSkill);

  const speedMult = skillSpeedMultiplier(cookingSkill.level);
  const ticksPerAction = recipe.ticksPerAction / speedMult;

  const totalTicks = (cookingSkill.tickProgress ?? 0) + effectiveTicks;
  const actionsCompleted = Math.floor(totalTicks / ticksPerAction);
  const remainingTicks = totalTicks % ticksPerAction;

  // Always update tick progress
  let newState: GameState = {
    ...state,
    skills: {
      ...state.skills,
      cooking: {
        ...cookingSkill,
        tickProgress: remainingTicks,
      },
    },
  };

  if (actionsCompleted <= 0) {
    return { state: newState, events: [] };
  }

  const events: GameEvent[] = [];
  let skill = newState.skills.cooking;

  for (let action = 0; action < actionsCompleted; action++) {
    // Check if bag is full
    if (isBagFull(newState.bag)) {
      events.push({ type: 'ACTIONS_PAUSED_BAG_FULL' });
      break;
    }

    // Check raw fish available
    const fishAvailable = newState.resources[recipe.inputResourceId]?.amount ?? 0;
    if (fishAvailable < recipe.inputAmount) {
      // No fish to cook — stop silently
      break;
    }

    // Deduct raw fish
    const resourceResult = removeResource(newState.resources, recipe.inputResourceId, recipe.inputAmount);
    newState = { ...newState, resources: resourceResult.resources };

    // Add cooked food to bag
    const bagResult = addItemToBag(newState.bag, recipe.outputItemId, recipe.outputAmount);
    newState = { ...newState, bag: bagResult.bag };

    if (bagResult.overflow > 0) {
      events.push({ type: 'BAG_FULL', itemId: recipe.outputItemId, quantity: bagResult.overflow });
      break;
    }

    // Award XP
    const xpMultiplier = getSkillXpMultiplier(newState, 'cooking');
    const xpGained = Math.max(1, Math.floor(recipe.xpPerAction * xpMultiplier));
    const xpResult = addSkillXp(skill, xpGained);

    skill = {
      ...newState.skills.cooking,
      xp: xpResult.newXp,
      level: xpResult.newLevel,
      tickProgress: remainingTicks,
    };

    // Check automation unlock
    if (!skill.automationUnlocked && skill.level >= SKILL_DEFINITIONS.cooking.automationUnlockLevel) {
      skill = { ...skill, automationUnlocked: true };
      events.push({ type: 'AUTOMATION_UNLOCKED', skillId: 'cooking' });
    }

    newState = {
      ...newState,
      skills: { ...newState.skills, cooking: skill },
    };

    if (xpResult.leveledUp) {
      events.push({ type: 'SKILL_LEVEL_UP', skillId: 'cooking', newLevel: xpResult.newLevel });
    }

    // Player XP (10%)
    const playerXpGained = Math.floor(xpGained * 0.1);
    if (playerXpGained > 0) {
      const playerResult = addPlayerXp(newState.player, playerXpGained);
      newState = {
        ...newState,
        player: {
          ...newState.player,
          xp: playerResult.newXp,
          level: playerResult.newLevel,
        },
      };
      if (playerResult.leveledUp) {
        events.push({ type: 'PLAYER_LEVEL_UP', newLevel: playerResult.newLevel });
      }
    }

    events.push({
      type: 'ITEM_DROPPED',
      skillId: 'cooking',
      itemId: recipe.outputItemId,
      quantity: recipe.outputAmount,
    });

    events.push({
      type: 'SKILL_ACTION',
      skillId: 'cooking',
      xpGained,
      resourceId: SKILL_DEFINITIONS.cooking.resourceProduced,
      resourceGained: 0,
    });
  }

  return { state: newState, events };
}
