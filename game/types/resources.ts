export type ResourceId =
  | 'wood'
  | 'oak_wood'
  | 'willow_wood'
  | 'maple_wood'
  | 'yew_wood'
  | 'magic_wood'
  | 'stone'
  | 'ore';

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
