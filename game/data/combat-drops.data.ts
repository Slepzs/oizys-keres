import type { ItemId } from '../types/items';

export interface CombatItemDropEntry {
  itemId: ItemId;
  /** Base chance (0-1) per kill */
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface CombatDropTable {
  coins: { min: number; max: number };
  items: CombatItemDropEntry[];
}

export const COMBAT_DROP_TABLES: Record<string, CombatDropTable> = {
  rat: {
    coins: { min: 1, max: 3 },
    items: [
      { itemId: 'rat_fang', chance: 0.35, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'bone_shard', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  wolf: {
    coins: { min: 2, max: 6 },
    items: [{ itemId: 'wolf_pelt', chance: 0.22, minQuantity: 1, maxQuantity: 1 }],
  },
  nerd: {
    coins: { min: 3, max: 9 },
    items: [{ itemId: 'nerd_notes', chance: 0.25, minQuantity: 1, maxQuantity: 2 }],
  },
  goblin: {
    coins: { min: 4, max: 12 },
    items: [
      { itemId: 'goblin_ear', chance: 0.20, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'bronze_ingot', chance: 0.10, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  skeleton: {
    coins: { min: 10, max: 24 },
    items: [{ itemId: 'bone_shard', chance: 0.40, minQuantity: 1, maxQuantity: 3 }],
  },
  orc: {
    coins: { min: 20, max: 45 },
    items: [{ itemId: 'orc_tusk', chance: 0.25, minQuantity: 1, maxQuantity: 2 }],
  },
  troll: {
    coins: { min: 35, max: 80 },
    items: [{ itemId: 'troll_toe', chance: 0.18, minQuantity: 1, maxQuantity: 1 }],
  },
  demon: {
    coins: { min: 60, max: 140 },
    items: [{ itemId: 'demon_essence', chance: 0.22, minQuantity: 1, maxQuantity: 1 }],
  },
};

