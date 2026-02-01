import type { ItemDefinition, ItemId, BagState } from '../types/items';

export const DEFAULT_BAG_SIZE = 20;

export const ITEM_DEFINITIONS: Record<ItemId, ItemDefinition> = {
  // Smithing products
  bronze_ingot: {
    id: 'bronze_ingot',
    name: 'Bronze Ingot',
    description: 'A bar of refined bronze, ready for crafting.',
    icon: '🟫',
    category: 'material',
    rarity: 'common',
    maxStack: 100,
  },
  iron_ingot: {
    id: 'iron_ingot',
    name: 'Iron Ingot',
    description: 'A bar of refined iron, stronger than bronze.',
    icon: '⬜',
    category: 'material',
    rarity: 'uncommon',
    maxStack: 100,
  },
  bronze_pickaxe: {
    id: 'bronze_pickaxe',
    name: 'Bronze Pickaxe',
    description: 'A sturdy pickaxe for mining rocks.',
    icon: '⛏️',
    category: 'tool',
    rarity: 'common',
    maxStack: 1,
  },
  bronze_hatchet: {
    id: 'bronze_hatchet',
    name: 'Bronze Hatchet',
    description: 'A reliable hatchet for chopping trees.',
    icon: '🪓',
    category: 'tool',
    rarity: 'common',
    maxStack: 1,
  },

  // Woodcutting drops
  tree_seed: {
    id: 'tree_seed',
    name: 'Tree Seed',
    description: 'A seed that could grow into a mighty tree.',
    icon: '🌱',
    category: 'misc',
    rarity: 'uncommon',
    maxStack: 50,
  },
  bird_nest: {
    id: 'bird_nest',
    name: 'Bird Nest',
    description: 'A fallen nest, sometimes containing treasures.',
    icon: '🪺',
    category: 'misc',
    rarity: 'rare',
    maxStack: 20,
  },

  // Mining drops
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    description: 'A precious red gemstone.',
    icon: '🔴',
    category: 'misc',
    rarity: 'rare',
    maxStack: 50,
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'A precious blue gemstone.',
    icon: '🔵',
    category: 'misc',
    rarity: 'rare',
    maxStack: 50,
  },
  geode: {
    id: 'geode',
    name: 'Geode',
    description: 'A mysterious rock that may contain crystals.',
    icon: '🪨',
    category: 'misc',
    rarity: 'epic',
    maxStack: 10,
  },
};

export const ITEM_IDS = Object.keys(ITEM_DEFINITIONS) as ItemId[];

/**
 * Create a fresh bag state with empty slots.
 */
export function createInitialBagState(): BagState {
  return {
    slots: Array(DEFAULT_BAG_SIZE).fill(null),
    maxSlots: DEFAULT_BAG_SIZE,
  };
}
