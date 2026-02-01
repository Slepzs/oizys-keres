export type ItemId =
  // Smithing products
  | 'bronze_ingot'
  | 'iron_ingot'
  | 'bronze_pickaxe'
  | 'bronze_hatchet'
  // Woodcutting drops
  | 'tree_seed'
  | 'bird_nest'
  // Mining drops
  | 'ruby'
  | 'sapphire'
  | 'geode';

export type ItemCategory = 'material' | 'tool' | 'equipment' | 'misc';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  icon: string;
  category: ItemCategory;
  rarity: ItemRarity;
  maxStack: number;
}

export interface BagSlot {
  itemId: ItemId;
  quantity: number;
}

export interface BagState {
  slots: (BagSlot | null)[];
  maxSlots: number;
}
