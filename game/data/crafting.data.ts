import type {
  CraftingCategory,
  CraftingRecipe,
  CraftingRecipeId,
  CraftingState,
  InfrastructureDefinition,
  InfrastructureId,
} from '../types/crafting';

export const INFRASTRUCTURE_DEFINITIONS: Record<InfrastructureId, InfrastructureDefinition> = {
  campfire: {
    id: 'campfire',
    name: 'Campfire',
    description: 'A warm campfire that boosts all training focus.',
    icon: 'campfire',
    fallbackIcon: '🔥',
    maxLevel: 1,
    bonuses: [{ target: 'xp', type: 'additive', value: 0.05 }],
  },
  workbench: {
    id: 'workbench',
    name: 'Workbench',
    description: 'A sturdy workbench for efficient woodcutting tools.',
    icon: 'anvil',
    fallbackIcon: '🧰',
    maxLevel: 1,
    bonuses: [{ target: 'woodcutting', type: 'additive', value: 0.12 }],
  },
  sawmill: {
    id: 'sawmill',
    name: 'Sawmill',
    description: 'Mechanized cutting that improves resource yield quality.',
    icon: 'cogs',
    fallbackIcon: '🏭',
    maxLevel: 1,
    bonuses: [{ target: 'drops', type: 'additive', value: 0.10 }],
  },
  armory: {
    id: 'armory',
    name: 'Armory',
    description: 'Organized storage and stations for advanced crafting.',
    icon: 'forging',
    fallbackIcon: '🛡️',
    maxLevel: 1,
    bonuses: [{ target: 'all_skills', type: 'additive', value: 0.08 }],
  },
};

export function createInitialCraftingState(): CraftingState {
  return {
    infrastructureLevels: {
      campfire: 0,
      workbench: 0,
      sawmill: 0,
      armory: 0,
    },
  };
}

export const CRAFTING_RECIPES: Record<CraftingRecipeId, CraftingRecipe> = {
  craft_bronze_hatchet: {
    id: 'craft_bronze_hatchet',
    name: 'Bronze Hatchet',
    description: 'A reliable hatchet for chopping trees.',
    icon: 'axe',
    fallbackIcon: '🪓',
    category: 'tools',
    requirements: [{ type: 'skill_level', skillId: 'woodcutting', level: 3 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 70 },
      { type: 'resource', resourceId: 'stone', amount: 25 },
      { type: 'resource', resourceId: 'ore', amount: 35 },
    ],
    output: { type: 'item', itemId: 'bronze_hatchet', quantity: 1 },
  },
  craft_bronze_pickaxe: {
    id: 'craft_bronze_pickaxe',
    name: 'Bronze Pickaxe',
    description: 'A sturdy pickaxe for mining rocks.',
    icon: 'mining-diamonds',
    fallbackIcon: '⛏️',
    category: 'tools',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 5 },
      { type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 90 },
      { type: 'resource', resourceId: 'stone', amount: 30 },
      { type: 'resource', resourceId: 'ore', amount: 55 },
    ],
    output: { type: 'item', itemId: 'bronze_pickaxe', quantity: 1 },
  },

  build_campfire: {
    id: 'build_campfire',
    name: 'Build Campfire',
    description: 'Adds a permanent +5% global XP bonus.',
    icon: 'campfire',
    fallbackIcon: '🔥',
    category: 'infrastructure',
    requirements: [{ type: 'skill_level', skillId: 'woodcutting', level: 4 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 120 },
      { type: 'resource', resourceId: 'stone', amount: 60 },
    ],
    output: { type: 'infrastructure', infrastructureId: 'campfire', levels: 1 },
    repeatable: false,
  },
  build_workbench: {
    id: 'build_workbench',
    name: 'Build Workbench',
    description: 'Adds a permanent +12% woodcutting XP bonus.',
    icon: 'anvil',
    fallbackIcon: '🧰',
    category: 'infrastructure',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 200 },
      { type: 'resource', resourceId: 'oak_wood', amount: 90 },
      { type: 'resource', resourceId: 'stone', amount: 140 },
    ],
    output: { type: 'infrastructure', infrastructureId: 'workbench', levels: 1 },
    repeatable: false,
  },
  build_sawmill: {
    id: 'build_sawmill',
    name: 'Build Sawmill',
    description: 'Adds a permanent +10% item drop chance bonus.',
    icon: 'cogs',
    fallbackIcon: '🏭',
    category: 'infrastructure',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 20 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 180 },
      { type: 'resource', resourceId: 'willow_wood', amount: 120 },
      { type: 'resource', resourceId: 'stone', amount: 240 },
      { type: 'item', itemId: 'tree_seed', amount: 3 },
    ],
    output: { type: 'infrastructure', infrastructureId: 'sawmill', levels: 1 },
    repeatable: false,
  },
  build_armory: {
    id: 'build_armory',
    name: 'Build Armory',
    description: 'Adds a permanent +8% all-skills XP bonus.',
    icon: 'forging',
    fallbackIcon: '🛡️',
    category: 'infrastructure',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 30 },
      { type: 'skill_level', skillId: 'mining', level: 16 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 180 },
      { type: 'resource', resourceId: 'maple_wood', amount: 120 },
      { type: 'resource', resourceId: 'ore', amount: 420 },
    ],
    output: { type: 'infrastructure', infrastructureId: 'armory', levels: 1 },
    repeatable: false,
  },

  craft_bronze_sword: {
    id: 'craft_bronze_sword',
    name: 'Bronze Sword',
    description: 'A basic sword made of bronze.',
    icon: 'broadsword',
    fallbackIcon: '🗡️',
    category: 'weapons',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 6 },
      { type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 85 },
      { type: 'resource', resourceId: 'ore', amount: 70 },
    ],
    output: { type: 'item', itemId: 'bronze_sword', quantity: 1 },
  },
  craft_iron_sword: {
    id: 'craft_iron_sword',
    name: 'Iron Sword',
    description: 'A sturdy sword forged from iron.',
    icon: 'broadsword',
    fallbackIcon: '🗡️',
    category: 'weapons',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 16 },
      { type: 'skill_level', skillId: 'mining', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 120 },
      { type: 'resource', resourceId: 'ore', amount: 150 },
    ],
    output: { type: 'item', itemId: 'iron_sword', quantity: 1 },
  },
  craft_steel_sword: {
    id: 'craft_steel_sword',
    name: 'Steel Sword',
    description: 'A sharp sword crafted from steel.',
    icon: 'broadsword',
    fallbackIcon: '🗡️',
    category: 'weapons',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 26 },
      { type: 'skill_level', skillId: 'mining', level: 18 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 140 },
      { type: 'resource', resourceId: 'ore', amount: 260 },
    ],
    output: { type: 'item', itemId: 'steel_sword', quantity: 1 },
  },
  craft_mithril_sword: {
    id: 'craft_mithril_sword',
    name: 'Mithril Sword',
    description: 'A legendary sword made of mithril.',
    icon: 'broadsword',
    fallbackIcon: '🗡️',
    category: 'weapons',
    requirements: [
      { type: 'skill_level', skillId: 'woodcutting', level: 38 },
      { type: 'skill_level', skillId: 'mining', level: 26 },
      { type: 'infrastructure_level', infrastructureId: 'armory', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'maple_wood', amount: 180 },
      { type: 'resource', resourceId: 'yew_wood', amount: 90 },
      { type: 'resource', resourceId: 'magic_wood', amount: 40 },
      { type: 'resource', resourceId: 'ore', amount: 460 },
    ],
    output: { type: 'item', itemId: 'mithril_sword', quantity: 1 },
  },

  craft_bronze_helmet: {
    id: 'craft_bronze_helmet',
    name: 'Bronze Helmet',
    description: 'A basic helmet made of bronze.',
    icon: 'helmet',
    fallbackIcon: '🪖',
    category: 'armor',
    requirements: [{ type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 60 },
      { type: 'resource', resourceId: 'ore', amount: 45 },
    ],
    output: { type: 'item', itemId: 'bronze_helmet', quantity: 1 },
  },
  craft_bronze_chestplate: {
    id: 'craft_bronze_chestplate',
    name: 'Bronze Chestplate',
    description: 'A basic chestplate made of bronze.',
    icon: 'vest',
    fallbackIcon: '🦺',
    category: 'armor',
    requirements: [{ type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 80 },
      { type: 'resource', resourceId: 'ore', amount: 65 },
    ],
    output: { type: 'item', itemId: 'bronze_chestplate', quantity: 1 },
  },
  craft_bronze_platelegs: {
    id: 'craft_bronze_platelegs',
    name: 'Bronze Platelegs',
    description: 'Basic leg armor made of bronze.',
    icon: 'leg-armor',
    fallbackIcon: '🩳',
    category: 'armor',
    requirements: [{ type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 70 },
      { type: 'resource', resourceId: 'ore', amount: 55 },
    ],
    output: { type: 'item', itemId: 'bronze_platelegs', quantity: 1 },
  },
  craft_leather_boots: {
    id: 'craft_leather_boots',
    name: 'Leather Boots',
    description: 'Basic boots made of leather.',
    icon: 'boot-stomp',
    fallbackIcon: '👢',
    category: 'armor',
    requirements: [{ type: 'infrastructure_level', infrastructureId: 'campfire', level: 1 }],
    costs: [
      { type: 'resource', resourceId: 'wood', amount: 45 },
      { type: 'resource', resourceId: 'ore', amount: 30 },
    ],
    output: { type: 'item', itemId: 'leather_boots', quantity: 1 },
  },
  craft_iron_helmet: {
    id: 'craft_iron_helmet',
    name: 'Iron Helmet',
    description: 'A sturdy helmet forged from iron.',
    icon: 'helmet',
    fallbackIcon: '🪖',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 80 },
      { type: 'resource', resourceId: 'ore', amount: 95 },
    ],
    output: { type: 'item', itemId: 'iron_helmet', quantity: 1 },
  },
  craft_iron_chestplate: {
    id: 'craft_iron_chestplate',
    name: 'Iron Chestplate',
    description: 'A sturdy chestplate forged from iron.',
    icon: 'vest',
    fallbackIcon: '🦺',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 110 },
      { type: 'resource', resourceId: 'ore', amount: 140 },
    ],
    output: { type: 'item', itemId: 'iron_chestplate', quantity: 1 },
  },
  craft_iron_platelegs: {
    id: 'craft_iron_platelegs',
    name: 'Iron Platelegs',
    description: 'Sturdy leg armor forged from iron.',
    icon: 'leg-armor',
    fallbackIcon: '🩳',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 95 },
      { type: 'resource', resourceId: 'ore', amount: 120 },
    ],
    output: { type: 'item', itemId: 'iron_platelegs', quantity: 1 },
  },
  craft_iron_boots: {
    id: 'craft_iron_boots',
    name: 'Iron Boots',
    description: 'Sturdy boots reinforced with iron.',
    icon: 'boot-stomp',
    fallbackIcon: '👢',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 10 },
      { type: 'infrastructure_level', infrastructureId: 'workbench', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'oak_wood', amount: 70 },
      { type: 'resource', resourceId: 'ore', amount: 80 },
    ],
    output: { type: 'item', itemId: 'iron_boots', quantity: 1 },
  },
  craft_steel_helmet: {
    id: 'craft_steel_helmet',
    name: 'Steel Helmet',
    description: 'A solid helmet crafted from steel.',
    icon: 'helmet',
    fallbackIcon: '🪖',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 18 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 90 },
      { type: 'resource', resourceId: 'ore', amount: 190 },
    ],
    output: { type: 'item', itemId: 'steel_helmet', quantity: 1 },
  },
  craft_steel_chestplate: {
    id: 'craft_steel_chestplate',
    name: 'Steel Chestplate',
    description: 'A solid chestplate crafted from steel.',
    icon: 'vest',
    fallbackIcon: '🦺',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 18 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 130 },
      { type: 'resource', resourceId: 'ore', amount: 270 },
    ],
    output: { type: 'item', itemId: 'steel_chestplate', quantity: 1 },
  },
  craft_steel_platelegs: {
    id: 'craft_steel_platelegs',
    name: 'Steel Platelegs',
    description: 'Solid leg armor crafted from steel.',
    icon: 'leg-armor',
    fallbackIcon: '🩳',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 18 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 110 },
      { type: 'resource', resourceId: 'ore', amount: 230 },
    ],
    output: { type: 'item', itemId: 'steel_platelegs', quantity: 1 },
  },
  craft_steel_boots: {
    id: 'craft_steel_boots',
    name: 'Steel Boots',
    description: 'Solid boots crafted from steel.',
    icon: 'boot-stomp',
    fallbackIcon: '👢',
    category: 'armor',
    requirements: [
      { type: 'skill_level', skillId: 'mining', level: 18 },
      { type: 'infrastructure_level', infrastructureId: 'sawmill', level: 1 },
    ],
    costs: [
      { type: 'resource', resourceId: 'willow_wood', amount: 85 },
      { type: 'resource', resourceId: 'ore', amount: 155 },
    ],
    output: { type: 'item', itemId: 'steel_boots', quantity: 1 },
  },
};

export const CRAFTING_RECIPE_IDS = Object.keys(CRAFTING_RECIPES) as CraftingRecipeId[];

export const CRAFTING_CATEGORIES: CraftingCategory[] = ['tools', 'infrastructure', 'weapons', 'armor'];

export function getRecipesByCategory(category: CraftingCategory): CraftingRecipe[] {
  return CRAFTING_RECIPE_IDS
    .map((recipeId) => CRAFTING_RECIPES[recipeId])
    .filter((recipe) => recipe.category === category);
}
