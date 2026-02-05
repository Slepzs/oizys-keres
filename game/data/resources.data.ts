import type { ResourceDefinition, ResourceId, ResourceState, ResourcesState } from '../types';

export const RESOURCE_DEFINITIONS: Record<ResourceId, ResourceDefinition> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Basic building material gathered from trees.',
    icon: '🪵',
  },
  oak_wood: {
    id: 'oak_wood',
    name: 'Oak Wood',
    description: 'Sturdy wood from oak trees.',
    icon: '🪵',
  },
  willow_wood: {
    id: 'willow_wood',
    name: 'Willow Wood',
    description: 'Flexible wood from willow trees.',
    icon: '🌿',
  },
  maple_wood: {
    id: 'maple_wood',
    name: 'Maple Wood',
    description: 'Beautiful wood from maple trees.',
    icon: '🍁',
  },
  yew_wood: {
    id: 'yew_wood',
    name: 'Yew Wood',
    description: 'Ancient wood from yew trees.',
    icon: '🌲',
  },
  magic_wood: {
    id: 'magic_wood',
    name: 'Magic Wood',
    description: 'Wood infused with magical energy.',
    icon: '✨',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    description: 'Hard material mined from rocks.',
    icon: '🪨',
  },
  ore: {
    id: 'ore',
    name: 'Ore',
    description: 'Raw metal ore for crafting.',
    icon: '⛏️',
  },
};

export function createInitialResourceState(): ResourceState {
  return {
    amount: 0,
    totalGained: 0,
  };
}

export function createInitialResourcesState(): ResourcesState {
  return {
    wood: createInitialResourceState(),
    oak_wood: createInitialResourceState(),
    willow_wood: createInitialResourceState(),
    maple_wood: createInitialResourceState(),
    yew_wood: createInitialResourceState(),
    magic_wood: createInitialResourceState(),
    stone: createInitialResourceState(),
    ore: createInitialResourceState(),
  };
}
