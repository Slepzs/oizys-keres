import type { EquipmentSlot, EquipmentStats } from './combat';

export type ItemId =
  // Smithing products
  | 'bronze_ingot'
  | 'iron_ingot'
  | 'bronze_pickaxe'
  | 'bronze_hatchet'
  // Combat drops
  | 'rat_fang'
  | 'wolf_pelt'
  | 'nerd_notes'
  | 'goblin_ear'
  | 'bone_shard'
  | 'orc_tusk'
  | 'troll_toe'
  | 'demon_essence'
  // Woodcutting drops
  | 'tree_seed'
  | 'bird_nest'
  // Mining drops
  | 'rock'
  | 'ruby'
  | 'sapphire'
  | 'geode'
  // Equipment - Weapons
  | 'bronze_sword'
  | 'iron_sword'
  | 'steel_sword'
  | 'mithril_sword'
  | 'rune_sword'
  | 'elderwood_blade'
  | 'arcane_warblade'
  // Equipment - Helmets
  | 'bronze_helmet'
  | 'iron_helmet'
  | 'steel_helmet'
  | 'mithril_helmet'
  | 'runic_helmet'
  | 'arcane_helmet'
  // Equipment - Chestplates
  | 'bronze_chestplate'
  | 'iron_chestplate'
  | 'steel_chestplate'
  | 'mithril_chestplate'
  | 'runic_chestplate'
  | 'arcane_chestplate'
  // Equipment - Legs
  | 'bronze_platelegs'
  | 'iron_platelegs'
  | 'steel_platelegs'
  | 'mithril_platelegs'
  | 'runic_platelegs'
  | 'arcane_platelegs'
  // Equipment - Boots
  | 'leather_boots'
  | 'iron_boots'
  | 'steel_boots'
  | 'mithril_boots'
  | 'runic_boots'
  | 'arcane_boots'
  // Equipment - Accessories
  | 'power_amulet'
  | 'defense_ring'
  | 'berserker_charm'
  | 'runed_war_ring';

export type ItemCategory = 'material' | 'tool' | 'equipment' | 'misc';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export type SortMode = 'rarity' | 'category' | 'quantity' | 'name';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  icon: string;
  category: ItemCategory;
  rarity: ItemRarity;
  maxStack: number;
  /**
   * Vendor sell price in coins (per item).
   * Keep this data-driven to make economy tuning straightforward.
   */
  sellPrice: number;
}

export interface EquipmentDefinition extends ItemDefinition {
  category: 'equipment';
  slot: EquipmentSlot;
  stats: EquipmentStats;
  levelRequired?: number;
}

export interface BagSlot {
  itemId: ItemId;
  quantity: number;
  locked?: boolean;
}

export interface BagState {
  slots: (BagSlot | null)[];
  maxSlots: number;
}

export function isEquipment(item: ItemDefinition): item is EquipmentDefinition {
  return item.category === 'equipment';
}
