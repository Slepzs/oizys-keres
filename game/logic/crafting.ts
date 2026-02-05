import { CRAFTING_RECIPES, INFRASTRUCTURE_DEFINITIONS } from '../data/crafting.data';
import { ITEM_DEFINITIONS } from '../data/items.data';
import { RESOURCE_DEFINITIONS } from '../data/resources.data';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import type { GameEvent } from '../systems/events.types';
import type { ItemId } from '../types/items';
import type { GameState } from '../types/state';
import type {
  CraftingCost,
  CraftingRecipe,
  CraftingRecipeId,
  CraftingRequirement,
  InfrastructureId,
} from '../types/crafting';
import { addItemToBag, countItemInBag, removeItemFromBag } from './bag';
import { addMultiplier } from './multipliers';
import { removeResource } from './resources';

export type CraftingSnapshotState = Pick<GameState, 'skills' | 'resources' | 'bag' | 'crafting'>;

export interface CraftingRecipeStatus {
  unlocked: boolean;
  missingRequirements: CraftingRequirement[];
  missingCosts: CraftingCost[];
  maxCraftable: number;
  atInfrastructureCap: boolean;
}

export interface CraftRecipeResult {
  success: boolean;
  state: GameState;
  events: GameEvent[];
  crafted: number;
  error?: string;
  recipe?: CraftingRecipe;
}

export function getCraftingRecipe(recipeId: CraftingRecipeId): CraftingRecipe | null {
  return CRAFTING_RECIPES[recipeId] ?? null;
}

export function getInfrastructureLevel(state: CraftingSnapshotState, infrastructureId: InfrastructureId): number {
  return state.crafting.infrastructureLevels[infrastructureId] ?? 0;
}

export function isCraftingRecipeUnlocked(state: CraftingSnapshotState, recipe: CraftingRecipe): boolean {
  return getMissingRequirements(state, recipe).length === 0;
}

export function getCraftingRecipeStatus(
  state: CraftingSnapshotState,
  recipeId: CraftingRecipeId
): CraftingRecipeStatus {
  const recipe = getCraftingRecipe(recipeId);

  if (!recipe) {
    return {
      unlocked: false,
      missingRequirements: [],
      missingCosts: [],
      maxCraftable: 0,
      atInfrastructureCap: false,
    };
  }

  const missingRequirements = getMissingRequirements(state, recipe);
  const missingCosts = getMissingCosts(state, recipe, 1);
  const atInfrastructureCap = isInfrastructureRecipeAtCap(state, recipe);

  let maxCraftable = 0;
  if (missingRequirements.length === 0 && !atInfrastructureCap) {
    maxCraftable = getMaxCraftableQuantity(state, recipe);
  }

  return {
    unlocked: missingRequirements.length === 0,
    missingRequirements,
    missingCosts,
    maxCraftable,
    atInfrastructureCap,
  };
}

export function getMaxCraftableQuantity(state: CraftingSnapshotState, recipe: CraftingRecipe): number {
  if (!isCraftingRecipeUnlocked(state, recipe)) {
    return 0;
  }

  if (isInfrastructureRecipeAtCap(state, recipe)) {
    return 0;
  }

  let maxByCosts = Number.POSITIVE_INFINITY;

  for (const cost of recipe.costs) {
    const available = getAvailableCostAmount(state, cost);
    const maxForCost = Math.floor(available / cost.amount);
    maxByCosts = Math.min(maxByCosts, maxForCost);
  }

  if (!Number.isFinite(maxByCosts)) {
    maxByCosts = 0;
  }

  if (maxByCosts <= 0) {
    return 0;
  }

  if (recipe.output.type === 'infrastructure') {
    const infrastructure = INFRASTRUCTURE_DEFINITIONS[recipe.output.infrastructureId];
    const currentLevel = getInfrastructureLevel(state, recipe.output.infrastructureId);
    const remainingLevels = Math.max(0, infrastructure.maxLevel - currentLevel);
    const maxByInfrastructureCap = Math.floor(remainingLevels / Math.max(1, recipe.output.levels));
    return Math.max(0, Math.min(maxByCosts, maxByInfrastructureCap));
  }

  const outputTotalPerCraft = Math.max(1, recipe.output.quantity);
  const bagCapacityForOutput = getBagCapacityForItem(state, recipe.output.itemId);
  const maxByBagCapacity = Math.floor(bagCapacityForOutput / outputTotalPerCraft);

  return Math.max(0, Math.min(maxByCosts, maxByBagCapacity));
}

export function craftRecipe(state: GameState, recipeId: CraftingRecipeId, quantity: number): CraftRecipeResult {
  const recipe = getCraftingRecipe(recipeId);

  if (!recipe) {
    return {
      success: false,
      error: 'Recipe not found.',
      state,
      events: [],
      crafted: 0,
    };
  }

  const requestedQuantity = Math.max(1, Math.floor(quantity));
  const status = getCraftingRecipeStatus(state, recipeId);

  if (!status.unlocked) {
    return {
      success: false,
      error: buildMissingRequirementsMessage(status.missingRequirements),
      state,
      events: [],
      crafted: 0,
      recipe,
    };
  }

  if (status.atInfrastructureCap) {
    return {
      success: false,
      error: 'Infrastructure already at max level.',
      state,
      events: [],
      crafted: 0,
      recipe,
    };
  }

  if (status.maxCraftable <= 0) {
    return {
      success: false,
      error: buildMissingCostsMessage(status.missingCosts),
      state,
      events: [],
      crafted: 0,
      recipe,
    };
  }

  const crafted = Math.min(requestedQuantity, status.maxCraftable);

  let newState: GameState = {
    ...state,
    resources: state.resources,
    bag: state.bag,
    crafting: state.crafting,
    multipliers: state.multipliers,
  };

  for (const cost of recipe.costs) {
    const totalCost = cost.amount * crafted;

    if (cost.type === 'resource') {
      const resourceResult = removeResource(newState.resources, cost.resourceId, totalCost);
      if (resourceResult.actualChange < totalCost) {
        return {
          success: false,
          error: 'Not enough resources.',
          state,
          events: [],
          crafted: 0,
          recipe,
        };
      }

      newState = {
        ...newState,
        resources: resourceResult.resources,
      };
      continue;
    }

    const bagResult = removeItemFromBag(newState.bag, cost.itemId, totalCost);
    if (bagResult.removed < totalCost) {
      return {
        success: false,
        error: 'Missing required materials in bag.',
        state,
        events: [],
        crafted: 0,
        recipe,
      };
    }

    newState = {
      ...newState,
      bag: bagResult.bag,
    };
  }

  const events: GameEvent[] = [];

  if (recipe.output.type === 'item') {
    const totalOutput = recipe.output.quantity * crafted;
    const addResult = addItemToBag(newState.bag, recipe.output.itemId, totalOutput);

    if (addResult.overflow > 0) {
      return {
        success: false,
        error: 'Not enough bag space for crafted output.',
        state,
        events: [],
        crafted: 0,
        recipe,
      };
    }

    newState = {
      ...newState,
      bag: addResult.bag,
    };

    events.push({
      type: 'ITEM_CRAFTED',
      recipeId,
      itemId: recipe.output.itemId,
      quantity: totalOutput,
      category: recipe.category,
    });
  } else {
    const infrastructureId = recipe.output.infrastructureId;
    const infrastructure = INFRASTRUCTURE_DEFINITIONS[infrastructureId];
    const currentLevel = getInfrastructureLevel(newState, infrastructureId);
    const nextLevel = Math.min(
      infrastructure.maxLevel,
      currentLevel + recipe.output.levels * crafted
    );

    newState = {
      ...newState,
      crafting: {
        ...newState.crafting,
        infrastructureLevels: {
          ...newState.crafting.infrastructureLevels,
          [infrastructureId]: nextLevel,
        },
      },
    };

    newState = applyInfrastructureBonuses(newState, infrastructureId, nextLevel);

    events.push({
      type: 'INFRASTRUCTURE_BUILT',
      infrastructureId,
      newLevel: nextLevel,
    });
  }

  return {
    success: true,
    state: newState,
    events,
    crafted,
    recipe,
  };
}

function getMissingRequirements(
  state: CraftingSnapshotState,
  recipe: CraftingRecipe
): CraftingRequirement[] {
  return recipe.requirements.filter((requirement) => !isRequirementMet(state, requirement));
}

function getMissingCosts(
  state: CraftingSnapshotState,
  recipe: CraftingRecipe,
  quantity: number
): CraftingCost[] {
  return recipe.costs.filter((cost) => {
    const required = cost.amount * quantity;
    return getAvailableCostAmount(state, cost) < required;
  });
}

function isRequirementMet(state: CraftingSnapshotState, requirement: CraftingRequirement): boolean {
  if (requirement.type === 'skill_level') {
    return (state.skills[requirement.skillId]?.level ?? 0) >= requirement.level;
  }

  return getInfrastructureLevel(state, requirement.infrastructureId) >= requirement.level;
}

function getAvailableCostAmount(state: CraftingSnapshotState, cost: CraftingCost): number {
  if (cost.type === 'resource') {
    return state.resources[cost.resourceId]?.amount ?? 0;
  }

  return countItemInBag(state.bag, cost.itemId);
}

function isInfrastructureRecipeAtCap(state: CraftingSnapshotState, recipe: CraftingRecipe): boolean {
  if (recipe.output.type !== 'infrastructure') {
    return false;
  }

  const infrastructure = INFRASTRUCTURE_DEFINITIONS[recipe.output.infrastructureId];
  const currentLevel = getInfrastructureLevel(state, recipe.output.infrastructureId);
  return currentLevel >= infrastructure.maxLevel;
}

function getBagCapacityForItem(state: CraftingSnapshotState, itemId: ItemId): number {
  const itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) {
    return 0;
  }

  let capacity = 0;
  for (const slot of state.bag.slots) {
    if (slot === null) {
      capacity += itemDef.maxStack;
      continue;
    }

    if (slot.itemId === itemId) {
      capacity += Math.max(0, itemDef.maxStack - slot.quantity);
    }
  }

  return capacity;
}

function applyInfrastructureBonuses(state: GameState, infrastructureId: InfrastructureId, level: number): GameState {
  const infrastructure = INFRASTRUCTURE_DEFINITIONS[infrastructureId];

  let nextState = state;
  for (const bonus of infrastructure.bonuses) {
    const value = bonus.type === 'additive'
      ? bonus.value * level
      : Math.pow(bonus.value, level);

    nextState = addMultiplier(nextState, {
      id: `infra:${infrastructureId}:${bonus.target}:${bonus.type}`,
      source: 'infrastructure',
      target: bonus.target,
      type: bonus.type,
      value,
    });
  }

  return nextState;
}

function buildMissingRequirementsMessage(requirements: CraftingRequirement[]): string {
  if (requirements.length === 0) {
    return 'Requirements not met.';
  }

  const requirement = requirements[0];

  if (requirement.type === 'skill_level') {
    const skillName = SKILL_DEFINITIONS[requirement.skillId].name;
    return `${skillName} level ${requirement.level} required.`;
  }

  const infrastructureName = INFRASTRUCTURE_DEFINITIONS[requirement.infrastructureId].name;
  return `${infrastructureName} is required.`;
}

function buildMissingCostsMessage(costs: CraftingCost[]): string {
  if (costs.length === 0) {
    return 'Not enough materials.';
  }

  const cost = costs[0];

  if (cost.type === 'resource') {
    return `Need more ${RESOURCE_DEFINITIONS[cost.resourceId].name}.`;
  }

  return `Need more ${ITEM_DEFINITIONS[cost.itemId].name}.`;
}
