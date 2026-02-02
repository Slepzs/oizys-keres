import type { ResourcesState, ResourceId } from '../types';
import { DEFAULT_MAX_STACK } from '../data/constants';
import { RESOURCE_DEFINITIONS } from '../data/resources.data';

export interface ResourceChangeResult {
  resources: ResourcesState;
  actualChange: number;
  capped: boolean;
}

/**
 * Add resources to inventory.
 */
export function addResource(
  resources: ResourcesState,
  resourceId: ResourceId,
  amount: number
): ResourceChangeResult {
  const current = resources[resourceId];
  const definition = RESOURCE_DEFINITIONS[resourceId];

  // Defensive: if resource doesn't exist in state or definitions, return unchanged
  if (!current || !definition) {
    console.warn(`Resource ${resourceId} not found in state or definitions`);
    return { resources, actualChange: 0, capped: false };
  }

  const maxStack = definition.maxStack ?? DEFAULT_MAX_STACK;

  const newAmount = Math.min(current.amount + amount, maxStack);
  const actualChange = newAmount - current.amount;

  return {
    resources: {
      ...resources,
      [resourceId]: {
        amount: newAmount,
        totalGained: current.totalGained + actualChange,
      },
    },
    actualChange,
    capped: newAmount >= maxStack,
  };
}

/**
 * Remove resources from inventory.
 * Returns the actual amount removed (may be less if insufficient).
 */
export function removeResource(
  resources: ResourcesState,
  resourceId: ResourceId,
  amount: number
): ResourceChangeResult {
  const current = resources[resourceId];
  const actualChange = Math.min(current.amount, amount);

  return {
    resources: {
      ...resources,
      [resourceId]: {
        ...current,
        amount: current.amount - actualChange,
      },
    },
    actualChange,
    capped: false,
  };
}

/**
 * Check if player has enough of a resource.
 */
export function hasResource(
  resources: ResourcesState,
  resourceId: ResourceId,
  amount: number
): boolean {
  return resources[resourceId].amount >= amount;
}

/**
 * Get total amount of a resource.
 */
export function getResourceAmount(
  resources: ResourcesState,
  resourceId: ResourceId
): number {
  return resources[resourceId].amount;
}
