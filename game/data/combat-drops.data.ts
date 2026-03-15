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
      { itemId: 'leather_boots', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  wolf: {
    coins: { min: 2, max: 6 },
    items: [
      { itemId: 'wolf_pelt', chance: 0.22, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'leather_boots', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'bronze_helmet', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  nerd: {
    coins: { min: 3, max: 9 },
    items: [
      { itemId: 'nerd_notes', chance: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'bronze_sword', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  goblin: {
    coins: { min: 4, max: 12 },
    items: [
      { itemId: 'goblin_ear', chance: 0.20, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'bronze_ingot', chance: 0.10, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'bronze_sword', chance: 0.03, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'bronze_helmet', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'leather_boots', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  skeleton: {
    coins: { min: 10, max: 24 },
    items: [
      { itemId: 'bone_shard', chance: 0.40, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'iron_sword', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'iron_helmet', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'iron_boots', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  orc: {
    coins: { min: 20, max: 45 },
    items: [
      { itemId: 'orc_tusk', chance: 0.25, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'steel_sword', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'steel_helmet', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'steel_chestplate', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  troll: {
    coins: { min: 35, max: 80 },
    items: [
      { itemId: 'troll_toe', chance: 0.18, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'steel_sword', chance: 0.03, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'steel_platelegs', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'power_amulet', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'defense_ring', chance: 0.01, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  demon: {
    coins: { min: 60, max: 140 },
    items: [
      { itemId: 'demon_essence', chance: 0.22, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_sword', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_helmet', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_boots', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'power_amulet', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  banshee: {
    coins: { min: 120, max: 260 },
    items: [
      { itemId: 'banshee_wisp', chance: 0.25, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_sword', chance: 0.03, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_chestplate', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'mithril_platelegs', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'defense_ring', chance: 0.03, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  dragon_whelp: {
    coins: { min: 200, max: 450 },
    items: [
      { itemId: 'dragon_scale', chance: 0.30, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'rune_sword', chance: 0.025, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'runic_helmet', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'runic_chestplate', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'berserker_charm', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  elder_demon: {
    coins: { min: 350, max: 800 },
    items: [
      { itemId: 'elder_demon_core', chance: 0.20, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'arcane_warblade', chance: 0.02, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'arcane_chestplate', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'arcane_helmet', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'runed_war_ring', chance: 0.015, minQuantity: 1, maxQuantity: 1 },
    ],
  },
};

