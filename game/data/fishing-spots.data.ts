import { createInitialFishingGearState } from './fishing-rods.data';
import type { FishingGearState } from '../types/state';
import type { ResourceId } from '../types/resources';
import type { FishingRodId, FishingSpotId } from '../types/skills';

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
  requiredRodId?: FishingRodId;
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
    requiredRodId: 'river_rod',
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
    requiredRodId: 'river_rod',
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
    requiredRodId: 'deepwater_rod',
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
    requiredRodId: 'deepwater_rod',
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
    requiredRodId: 'abyssal_rod',
  },
};

export const FISHING_SPOT_IDS = Object.keys(FISHING_SPOTS) as FishingSpotId[];

type FishingGearSelectionState = Pick<FishingGearState, 'ownedRodIds'>;

function canUseSpot(
  fishingLevel: number,
  spot: FishingSpot,
  fishingGear: FishingGearSelectionState
): boolean {
  return (
    spot.levelRequired <= fishingLevel
    && (!spot.requiredRodId || fishingGear.ownedRodIds.includes(spot.requiredRodId))
  );
}

export function getAvailableFishingSpots(
  fishingLevel: number,
  fishingGear: FishingGearSelectionState = createInitialFishingGearState()
): FishingSpot[] {
  return Object.values(FISHING_SPOTS).filter(
    (spot) => canUseSpot(fishingLevel, spot, fishingGear)
  );
}

export function getDefaultFishingSpot(
  fishingLevel: number,
  fishingGear: FishingGearSelectionState = createInitialFishingGearState()
): FishingSpot {
  const available = getAvailableFishingSpots(fishingLevel, fishingGear);
  return available[available.length - 1] ?? FISHING_SPOTS.pond;
}
