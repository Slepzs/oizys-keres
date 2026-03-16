import type { ResourceId } from '../types/resources';
import type { FishingSpotId } from '../types/skills';

export interface FishingSpot {
  id: FishingSpotId;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  ticksPerAction: number;
}

export const FISHING_SPOTS: Record<FishingSpotId, FishingSpot> = {
  pond: {
    id: 'pond',
    name: 'Shallow Pond',
    description: 'A calm freshwater pond. Good for beginners.',
    icon: '🪣',
    levelRequired: 1,
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shrimp',
    ticksPerAction: 30,
  },
  lake: {
    id: 'lake',
    name: 'Freshwater Lake',
    description: 'A wide lake teeming with sardines.',
    icon: '🌊',
    levelRequired: 10,
    baseXpPerAction: 22,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_sardine',
    ticksPerAction: 36,
  },
  river: {
    id: 'river',
    name: 'Mountain River',
    description: 'A fast river where trout are plentiful.',
    icon: '🏞️',
    levelRequired: 20,
    baseXpPerAction: 38,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_trout',
    ticksPerAction: 42,
  },
  bay: {
    id: 'bay',
    name: 'Coastal Bay',
    description: 'Saltwater fishing for prized salmon.',
    icon: '⚓',
    levelRequired: 35,
    baseXpPerAction: 58,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_salmon',
    ticksPerAction: 48,
  },
  deep_sea: {
    id: 'deep_sea',
    name: 'Deep Sea',
    description: 'Open waters where lobsters lurk on the seabed.',
    icon: '🦞',
    levelRequired: 50,
    baseXpPerAction: 85,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_lobster',
    ticksPerAction: 55,
  },
  ocean: {
    id: 'ocean',
    name: 'Open Ocean',
    description: 'The vast ocean where swordfish roam.',
    icon: '🌍',
    levelRequired: 65,
    baseXpPerAction: 120,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_swordfish',
    ticksPerAction: 64,
  },
  abyss: {
    id: 'abyss',
    name: 'Abyssal Trench',
    description: 'The deepest waters. Sharks circle the darkness.',
    icon: '🦈',
    levelRequired: 80,
    baseXpPerAction: 160,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shark',
    ticksPerAction: 75,
  },
};

export const FISHING_SPOT_IDS = Object.keys(FISHING_SPOTS) as FishingSpotId[];

export function getAvailableFishingSpots(fishingLevel: number): FishingSpot[] {
  return Object.values(FISHING_SPOTS).filter(
    (spot) => spot.levelRequired <= fishingLevel
  );
}

export function getDefaultFishingSpot(fishingLevel: number): FishingSpot {
  const available = getAvailableFishingSpots(fishingLevel);
  return available[available.length - 1];
}
