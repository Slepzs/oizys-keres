import type { ResourceId } from '../types/resources';
import type { ItemId } from '../types/items';
import type { CookingRecipeId } from '../types/skills';

export interface CookingRecipe {
  id: CookingRecipeId;
  name: string;
  icon: string;
  description: string;
  inputResourceId: ResourceId;
  inputAmount: number;
  outputItemId: ItemId;
  outputAmount: number;
  xpPerAction: number;
  cookingLevelRequired: number;
  ticksPerAction: number;
}

export const COOKING_RECIPES: Record<CookingRecipeId, CookingRecipe> = {
  cook_shrimp: {
    id: 'cook_shrimp',
    name: 'Shrimp',
    icon: '🍤',
    description: 'Cook raw shrimp. Restores 3 HP.',
    inputResourceId: 'raw_shrimp',
    inputAmount: 1,
    outputItemId: 'shrimp',
    outputAmount: 1,
    xpPerAction: 30,
    cookingLevelRequired: 1,
    ticksPerAction: 25,
  },
  cook_sardine: {
    id: 'cook_sardine',
    name: 'Sardine',
    icon: '🐟',
    description: 'Cook raw sardine. Restores 4 HP.',
    inputResourceId: 'raw_sardine',
    inputAmount: 1,
    outputItemId: 'sardine',
    outputAmount: 1,
    xpPerAction: 40,
    cookingLevelRequired: 5,
    ticksPerAction: 25,
  },
  cook_trout: {
    id: 'cook_trout',
    name: 'Trout',
    icon: '🐠',
    description: 'Cook raw trout. Restores 7 HP.',
    inputResourceId: 'raw_trout',
    inputAmount: 1,
    outputItemId: 'trout',
    outputAmount: 1,
    xpPerAction: 70,
    cookingLevelRequired: 15,
    ticksPerAction: 30,
  },
  cook_salmon: {
    id: 'cook_salmon',
    name: 'Salmon',
    icon: '🐡',
    description: 'Cook raw salmon. Restores 9 HP.',
    inputResourceId: 'raw_salmon',
    inputAmount: 1,
    outputItemId: 'salmon',
    outputAmount: 1,
    xpPerAction: 90,
    cookingLevelRequired: 25,
    ticksPerAction: 30,
  },
  cook_lobster: {
    id: 'cook_lobster',
    name: 'Lobster',
    icon: '🦞',
    description: 'Cook raw lobster. Restores 12 HP.',
    inputResourceId: 'raw_lobster',
    inputAmount: 1,
    outputItemId: 'lobster',
    outputAmount: 1,
    xpPerAction: 120,
    cookingLevelRequired: 40,
    ticksPerAction: 35,
  },
  cook_swordfish: {
    id: 'cook_swordfish',
    name: 'Swordfish',
    icon: '🐟',
    description: 'Cook raw swordfish. Restores 14 HP.',
    inputResourceId: 'raw_swordfish',
    inputAmount: 1,
    outputItemId: 'swordfish',
    outputAmount: 1,
    xpPerAction: 140,
    cookingLevelRequired: 50,
    ticksPerAction: 35,
  },
  cook_shark: {
    id: 'cook_shark',
    name: 'Shark',
    icon: '🦈',
    description: 'Cook raw shark. Restores 20 HP.',
    inputResourceId: 'raw_shark',
    inputAmount: 1,
    outputItemId: 'shark',
    outputAmount: 1,
    xpPerAction: 210,
    cookingLevelRequired: 80,
    ticksPerAction: 40,
  },
};

export const COOKING_RECIPE_IDS = Object.keys(COOKING_RECIPES) as CookingRecipeId[];

export function getAvailableCookingRecipes(level: number): CookingRecipe[] {
  return COOKING_RECIPE_IDS
    .map((id) => COOKING_RECIPES[id])
    .filter((recipe) => recipe.cookingLevelRequired <= level);
}

export function getDefaultCookingRecipe(level: number): CookingRecipe {
  const available = getAvailableCookingRecipes(level);
  return available[available.length - 1] ?? COOKING_RECIPES.cook_shrimp;
}
