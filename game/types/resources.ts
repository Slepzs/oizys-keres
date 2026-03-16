export type ResourceId =
  | 'wood'
  | 'oak_wood'
  | 'willow_wood'
  | 'maple_wood'
  | 'yew_wood'
  | 'magic_wood'
  | 'stone'
  | 'ore'
  | 'copper_ore'
  | 'iron_ore'
  | 'coal'
  | 'mithril_ore'
  | 'adamantite_ore'
  | 'spirit_essence'
  | 'raw_shrimp'
  | 'raw_sardine'
  | 'raw_trout'
  | 'raw_salmon'
  | 'raw_lobster'
  | 'raw_swordfish'
  | 'raw_shark';

export interface ResourceState {
  amount: number;
  totalGained: number;
}

export type ResourcesState = Record<ResourceId, ResourceState>;

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
  description: string;
  icon: string;
  maxStack?: number;
}
