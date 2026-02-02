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
  | 'ruby'
  | 'sapphire'
  | 'geode'
  // Equipment - Weapons
  | 'bronze_sword'
  | 'iron_sword'
  | 'steel_sword'
  | 'mithril_sword'
  // Equipment - Helmets
  | 'bronze_helmet'
  | 'iron_helmet'
  | 'steel_helmet'
  // Equipment - Chestplates
  | 'bronze_chestplate'
  | 'iron_chestplate'
  | 'steel_chestplate'
  // Equipment - Legs
  | 'bronze_platelegs'
  | 'iron_platelegs'
  | 'steel_platelegs'
  // Equipment - Boots
  | 'leather_boots'
  | 'iron_boots'
  | 'steel_boots'
  // Equipment - Accessories
  | 'power_amulet'
  | 'defense_ring';

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
