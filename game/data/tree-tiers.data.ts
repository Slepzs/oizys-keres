import type { ResourceId } from '../types/resources';

export interface TreeTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  ticksPerAction: number;
  dropTableId?: string;
}

export const WOODCUTTING_TREES: Record<string, TreeTier> = {
  normal: {
    id: 'normal',
    name: 'Normal Tree',
    description: 'A common tree. Good for beginners.',
    icon: '🌳',
    levelRequired: 1,
    baseXpPerAction: 10,
    baseResourcePerAction: 1,
    resourceProduced: 'wood',
    ticksPerAction: 30,
  },
  oak: {
    id: 'oak',
    name: 'Oak Tree',
    description: 'A sturdy oak tree.',
    icon: '🌲',
    levelRequired: 15,
    baseXpPerAction: 20,
    baseResourcePerAction: 1,
    resourceProduced: 'oak_wood',
    ticksPerAction: 35,
  },
  willow: {
    id: 'willow',
    name: 'Willow Tree',
    description: 'A flexible willow tree from the swamps.',
    icon: '🌿',
    levelRequired: 30,
    baseXpPerAction: 35,
    baseResourcePerAction: 1,
    resourceProduced: 'willow_wood',
    ticksPerAction: 40,
  },
  maple: {
    id: 'maple',
    name: 'Maple Tree',
    description: 'A beautiful maple tree.',
    icon: '🍁',
    levelRequired: 45,
    baseXpPerAction: 55,
    baseResourcePerAction: 1,
    resourceProduced: 'maple_wood',
    ticksPerAction: 45,
  },
  yew: {
    id: 'yew',
    name: 'Yew Tree',
    description: 'An ancient yew tree.',
    icon: '🌲',
    levelRequired: 60,
    baseXpPerAction: 85,
    baseResourcePerAction: 1,
    resourceProduced: 'yew_wood',
    ticksPerAction: 55,
  },
  magic: {
    id: 'magic',
    name: 'Magic Tree',
    description: 'A tree infused with magical energy.',
    icon: '✨',
    levelRequired: 75,
    baseXpPerAction: 120,
    baseResourcePerAction: 1,
    resourceProduced: 'magic_wood',
    ticksPerAction: 65,
  },
};

export const TREE_IDS = Object.keys(WOODCUTTING_TREES);

export function getAvailableTrees(woodcuttingLevel: number): TreeTier[] {
  return Object.values(WOODCUTTING_TREES).filter(
    (tree) => tree.levelRequired <= woodcuttingLevel
  );
}

export function getDefaultTree(woodcuttingLevel: number): TreeTier {
  const available = getAvailableTrees(woodcuttingLevel);
  // Return highest tier tree available (last in array)
  return available[available.length - 1];
}
