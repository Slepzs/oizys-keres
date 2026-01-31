import type { ResourceDefinition, ResourceId, ResourceState, ResourcesState } from '../types';

export const RESOURCE_DEFINITIONS: Record<ResourceId, ResourceDefinition> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Basic building material gathered from trees.',
    icon: '🪵',
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
    description: 'Raw metal ore for smithing.',
    icon: '�ite',
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
    stone: createInitialResourceState(),
    ore: createInitialResourceState(),
  };
}
