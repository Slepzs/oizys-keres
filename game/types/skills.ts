import type { ResourceId } from './resources';

export type SkillId = 'woodcutting' | 'mining' | 'crafting' | 'summoning' | 'fishing' | 'cooking' | 'herblore';
export type TreeTierId = 'normal' | 'oak' | 'willow' | 'maple' | 'yew' | 'magic';
export type RockTierId = 'limestone' | 'copper' | 'iron' | 'coal' | 'mithril' | 'adamantite';
export type FishingSpotId = 'pond' | 'lake' | 'river' | 'bay' | 'deep_sea' | 'ocean' | 'abyss';
export type CookingRecipeId = 'cook_shrimp' | 'cook_sardine' | 'cook_trout' | 'cook_salmon' | 'cook_lobster' | 'cook_swordfish' | 'cook_shark';
export type HerbloreRecipeId =
  | 'brew_attack_potion'
  | 'brew_defence_potion'
  | 'brew_strength_potion'
  | 'brew_super_attack_potion'
  | 'brew_super_strength_potion';

export interface SkillState {
  level: number;
  xp: number;
  automationUnlocked: boolean;
  automationEnabled: boolean;
  tickProgress: number;
  activeTreeId?: TreeTierId;
  activeRockId?: RockTierId;
  activeFishingSpotId?: FishingSpotId;
  activeCookingRecipeId?: CookingRecipeId;
  activeHerbloreRecipeId?: HerbloreRecipeId;
}

export type SkillsState = Record<SkillId, SkillState>;

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  automationUnlockLevel: number;
  ticksPerAction: number;
}
