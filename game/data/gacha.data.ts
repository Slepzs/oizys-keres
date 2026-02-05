import type { GachaPackDefinition, GachaPackId } from '../types/shop';

export const GACHA_PACK_IDS: GachaPackId[] = ['shopkeeper_starter_pack'];

/**
 * Weighted table for the first shopkeeper pack.
 * Focuses on crafting materials with occasional gear upgrades.
 */
export const GACHA_PACKS: Record<GachaPackId, GachaPackDefinition> = {
  shopkeeper_starter_pack: {
    id: 'shopkeeper_starter_pack',
    name: 'Prospector Pack',
    description: '5 pulls with mixed materials, gems, and a slim chance at gear upgrades.',
    itemsPerPack: 5,
    drops: [
      { itemId: 'rock', weight: 18 },
      { itemId: 'bronze_ingot', weight: 22 },
      { itemId: 'iron_ingot', weight: 18 },
      { itemId: 'tree_seed', weight: 10 },
      { itemId: 'bone_shard', weight: 8 },
      { itemId: 'ruby', weight: 7 },
      { itemId: 'sapphire', weight: 5 },
      { itemId: 'geode', weight: 3 },
      { itemId: 'bronze_pickaxe', weight: 3 },
      { itemId: 'bronze_hatchet', weight: 2 },
      { itemId: 'bronze_sword', weight: 2 },
      { itemId: 'iron_sword', weight: 1 },
      { itemId: 'steel_sword', weight: 1 },
    ],
  },
};
