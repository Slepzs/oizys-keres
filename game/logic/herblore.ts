import { HERBLORE_RECIPES, getAvailableHerbloreRecipes, getDefaultHerbloreRecipe } from '../data/herblore-recipes.data';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import { skillSpeedMultiplier } from '../data/curves';
import type { HerbloreRecipe } from '../data/herblore-recipes.data';
import type { HerbloreRecipeId, SkillState } from '../types/skills';
import type { GameState } from '../types/state';
import type { GameEvent } from '../systems/events.types';
import { addItemToBag, isBagFull, removeItemFromBag } from './bag';
import { addSkillXp, addPlayerXp } from './xp';
import { getSkillXpMultiplier } from './multipliers';

export interface HerbloreSelectionState {
  level: number;
  activeHerbloreRecipeId?: HerbloreRecipeId;
}

export interface HerbloreTickResult {
  state: GameState;
  events: GameEvent[];
}

export function getActiveHerbloreRecipe(skill: HerbloreSelectionState): HerbloreRecipe {
  const recipeId = skill.activeHerbloreRecipeId;
  if (recipeId && HERBLORE_RECIPES[recipeId] && skill.level >= HERBLORE_RECIPES[recipeId].herbloreLevelRequired) {
    return HERBLORE_RECIPES[recipeId];
  }
  return getDefaultHerbloreRecipe(skill.level);
}

export function getHerbloreRecipesForLevel(level: number): HerbloreRecipe[] {
  return getAvailableHerbloreRecipes(level);
}

export function setActiveHerbloreRecipe(skill: SkillState, recipeId: HerbloreRecipeId): SkillState {
  const recipe = HERBLORE_RECIPES[recipeId];
  if (!recipe || skill.level < recipe.herbloreLevelRequired) {
    return skill;
  }
  return { ...skill, activeHerbloreRecipeId: recipeId };
}

/**
 * Process herblore automation tick.
 * Called directly from processTick — handles active and automated herblore.
 */
export function processHerbloreTick(state: GameState, ticksElapsed: number): HerbloreTickResult {
  const herbloreSkill = state.skills.herblore;
  if (!herbloreSkill) {
    return { state, events: [] };
  }

  const isActive = state.activeSkill === 'herblore';
  const isAutomated = herbloreSkill.automationEnabled && !isActive;

  if (!isActive && !isAutomated) {
    return { state, events: [] };
  }

  const effectiveTicks = isAutomated ? ticksElapsed * 0.5 : ticksElapsed;
  const recipe = getActiveHerbloreRecipe(herbloreSkill);

  const speedMult = skillSpeedMultiplier(herbloreSkill.level);
  const ticksPerAction = recipe.ticksPerAction / speedMult;

  const totalTicks = (herbloreSkill.tickProgress ?? 0) + effectiveTicks;
  const actionsCompleted = Math.floor(totalTicks / ticksPerAction);
  const remainingTicks = totalTicks % ticksPerAction;

  // Always update tick progress
  let newState: GameState = {
    ...state,
    skills: {
      ...state.skills,
      herblore: {
        ...herbloreSkill,
        tickProgress: remainingTicks,
      },
    },
  };

  if (actionsCompleted <= 0) {
    return { state: newState, events: [] };
  }

  const events: GameEvent[] = [];
  let skill = newState.skills.herblore;

  for (let action = 0; action < actionsCompleted; action++) {
    // Check if bag is full
    if (isBagFull(newState.bag)) {
      events.push({ type: 'ACTIONS_PAUSED_BAG_FULL' });
      break;
    }

    // Check herb available in bag
    const bagResult = removeItemFromBag(newState.bag, recipe.inputItemId, recipe.inputAmount);
    if (bagResult.removed < recipe.inputAmount) {
      // No herb to brew — stop silently
      break;
    }
    newState = { ...newState, bag: bagResult.bag };

    // Add potion to bag
    const addResult = addItemToBag(newState.bag, recipe.outputItemId, recipe.outputAmount);
    newState = { ...newState, bag: addResult.bag };

    if (addResult.overflow > 0) {
      events.push({ type: 'BAG_FULL', itemId: recipe.outputItemId, quantity: addResult.overflow });
      break;
    }

    // Award XP
    const xpMultiplier = getSkillXpMultiplier(newState, 'herblore');
    const xpGained = Math.max(1, Math.floor(recipe.xpPerAction * xpMultiplier));
    const xpResult = addSkillXp(skill, xpGained);

    skill = {
      ...newState.skills.herblore,
      xp: xpResult.newXp,
      level: xpResult.newLevel,
      tickProgress: remainingTicks,
    };

    // Check automation unlock
    if (!skill.automationUnlocked && skill.level >= SKILL_DEFINITIONS.herblore.automationUnlockLevel) {
      skill = { ...skill, automationUnlocked: true };
      events.push({ type: 'AUTOMATION_UNLOCKED', skillId: 'herblore' });
    }

    newState = {
      ...newState,
      skills: { ...newState.skills, herblore: skill },
    };

    if (xpResult.leveledUp) {
      events.push({ type: 'SKILL_LEVEL_UP', skillId: 'herblore', newLevel: xpResult.newLevel });
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
      skillId: 'herblore',
      itemId: recipe.outputItemId,
      quantity: recipe.outputAmount,
    });

    events.push({
      type: 'SKILL_ACTION',
      skillId: 'herblore',
      xpGained,
      resourceId: SKILL_DEFINITIONS.herblore.resourceProduced,
      resourceGained: 0,
    });
  }

  return { state: newState, events };
}
