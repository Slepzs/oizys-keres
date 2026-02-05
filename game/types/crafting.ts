import type { ItemId } from './items';
import type { MultiplierTarget } from './multipliers';
import type { ResourceId } from './resources';
import type { SkillId } from './skills';

export type InfrastructureId = 'campfire' | 'workbench' | 'sawmill' | 'armory';

export type CraftingCategory = 'tools' | 'infrastructure' | 'weapons' | 'armor';

export type CraftingRecipeId =
  | 'craft_bronze_hatchet'
  | 'craft_bronze_pickaxe'
  | 'build_campfire'
  | 'build_workbench'
  | 'build_sawmill'
  | 'build_armory'
  | 'craft_bronze_sword'
  | 'craft_iron_sword'
  | 'craft_steel_sword'
  | 'craft_mithril_sword'
  | 'craft_bronze_helmet'
  | 'craft_bronze_chestplate'
  | 'craft_bronze_platelegs'
  | 'craft_leather_boots'
  | 'craft_iron_helmet'
  | 'craft_iron_chestplate'
  | 'craft_iron_platelegs'
  | 'craft_iron_boots'
  | 'craft_steel_helmet'
  | 'craft_steel_chestplate'
  | 'craft_steel_platelegs'
  | 'craft_steel_boots';

export type CraftingRequirement =
  | { type: 'skill_level'; skillId: SkillId; level: number }
  | { type: 'infrastructure_level'; infrastructureId: InfrastructureId; level: number };

export type CraftingCost =
  | { type: 'resource'; resourceId: ResourceId; amount: number }
  | { type: 'item'; itemId: ItemId; amount: number };

export type CraftingOutput =
  | { type: 'item'; itemId: ItemId; quantity: number }
  | { type: 'infrastructure'; infrastructureId: InfrastructureId; levels: number };

export interface CraftingRecipe {
  id: CraftingRecipeId;
  name: string;
  description: string;
  icon: string;
  fallbackIcon: string;
  category: CraftingCategory;
  requirements: CraftingRequirement[];
  costs: CraftingCost[];
  output: CraftingOutput;
  repeatable?: boolean;
}

export interface InfrastructureBonus {
  target: MultiplierTarget;
  type: 'additive' | 'multiplicative';
  value: number;
}

export interface InfrastructureDefinition {
  id: InfrastructureId;
  name: string;
  description: string;
  icon: string;
  fallbackIcon: string;
  maxLevel: number;
  bonuses: InfrastructureBonus[];
}

export type InfrastructureLevelsState = Record<InfrastructureId, number>;

export interface CraftingState {
  infrastructureLevels: InfrastructureLevelsState;
}
