import type { GachaPackDefinition, GachaPackId } from '../types/shop';

export const GACHA_PACK_IDS: GachaPackId[] = ['shopkeeper_starter_pack'];

/**
 * Weighted table for the first shopkeeper pack.
 * 80% of drops are rocks; the remaining 20% are weapons/rare upgrades.
 */
export const GACHA_PACKS: Record<GachaPackId, GachaPackDefinition> = {
  shopkeeper_starter_pack: {
    id: 'shopkeeper_starter_pack',
    name: 'Prospector Pack',
    description: '5 pulls with mostly rocks and a small shot at weapon upgrades.',
    itemsPerPack: 5,
    drops: [
      { itemId: 'rock', weight: 80 },
      { itemId: 'bronze_sword', weight: 12 },
      { itemId: 'iron_sword', weight: 6 },
      { itemId: 'mithril_sword', weight: 2 },
    ],
  },
};
