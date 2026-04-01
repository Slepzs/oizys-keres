import type { ItemId } from '../types/items';
import type { HerbloreRecipeId } from '../types/skills';

export interface HerbloreRecipe {
  id: HerbloreRecipeId;
  name: string;
  icon: string;
  description: string;
  inputItemId: ItemId;
  inputAmount: number;
  outputItemId: ItemId;
  outputAmount: number;
  xpPerAction: number;
  herbloreLevelRequired: number;
  ticksPerAction: number;
}

export const HERBLORE_RECIPES: Record<HerbloreRecipeId, HerbloreRecipe> = {
  brew_attack_potion: {
    id: 'brew_attack_potion',
    name: 'Attack Potion',
    icon: '⚗️',
    description: 'Brew a Guam herb into an Attack Potion (+6 attack for 5 min).',
    inputItemId: 'guam_herb',
    inputAmount: 1,
    outputItemId: 'attack_potion',
    outputAmount: 1,
    xpPerAction: 35,
    herbloreLevelRequired: 1,
    ticksPerAction: 30,
  },
  brew_defence_potion: {
    id: 'brew_defence_potion',
    name: 'Defence Potion',
    icon: '🛡️',
    description: 'Brew a Marrentill herb into a Defence Potion (+6 defence for 5 min).',
    inputItemId: 'marrentill_herb',
    inputAmount: 1,
    outputItemId: 'defence_potion',
    outputAmount: 1,
    xpPerAction: 50,
    herbloreLevelRequired: 15,
    ticksPerAction: 32,
  },
  brew_strength_potion: {
    id: 'brew_strength_potion',
    name: 'Strength Potion',
    icon: '💪',
    description: 'Brew a Tarromin herb into a Strength Potion (+6 strength for 5 min).',
    inputItemId: 'tarromin_herb',
    inputAmount: 1,
    outputItemId: 'strength_potion',
    outputAmount: 1,
    xpPerAction: 65,
    herbloreLevelRequired: 25,
    ticksPerAction: 35,
  },
  brew_super_attack_potion: {
    id: 'brew_super_attack_potion',
    name: 'Super Attack Potion',
    icon: '⚗️',
    description: 'Brew a Harralander herb into a Super Attack Potion (+12 attack for 5 min).',
    inputItemId: 'harralander_herb',
    inputAmount: 1,
    outputItemId: 'super_attack_potion',
    outputAmount: 1,
    xpPerAction: 100,
    herbloreLevelRequired: 45,
    ticksPerAction: 40,
  },
  brew_super_strength_potion: {
    id: 'brew_super_strength_potion',
    name: 'Super Strength Potion',
    icon: '💪',
    description: 'Brew a Ranarr herb into a Super Strength Potion (+12 strength for 5 min).',
    inputItemId: 'ranarr_herb',
    inputAmount: 1,
    outputItemId: 'super_strength_potion',
    outputAmount: 1,
    xpPerAction: 150,
    herbloreLevelRequired: 65,
    ticksPerAction: 45,
  },
};

export const HERBLORE_RECIPE_IDS = Object.keys(HERBLORE_RECIPES) as HerbloreRecipeId[];

export function getAvailableHerbloreRecipes(level: number): HerbloreRecipe[] {
  return HERBLORE_RECIPE_IDS
    .map((id) => HERBLORE_RECIPES[id])
    .filter((recipe) => recipe.herbloreLevelRequired <= level);
}

export function getDefaultHerbloreRecipe(level: number): HerbloreRecipe {
  const available = getAvailableHerbloreRecipes(level);
  return available[available.length - 1] ?? HERBLORE_RECIPES.brew_attack_potion;
}
