import type { FishingGearState } from '../types/state';
import type { FishingRodId, FishingSpotId } from '../types/skills';

export interface FishingRodDefinition {
  id: FishingRodId;
  name: string;
  description: string;
  icon: string;
  priceCoins: number;
  unlocksSpots: FishingSpotId[];
}

export const FISHING_RODS: Record<FishingRodId, FishingRodDefinition> = {
  river_rod: {
    id: 'river_rod',
    name: 'River Rod',
    description: 'A reinforced rod built for stronger currents and coastal runs.',
    icon: '🎣',
    priceCoins: 1_200,
    unlocksSpots: ['river', 'bay'],
  },
  deepwater_rod: {
    id: 'deepwater_rod',
    name: 'Deepwater Rod',
    description: 'A heavy sea rod for deepwater crustaceans and ocean predators.',
    icon: '🪝',
    priceCoins: 4_500,
    unlocksSpots: ['deep_sea', 'ocean'],
  },
  abyssal_rod: {
    id: 'abyssal_rod',
    name: 'Abyssal Rod',
    description: 'A rare pressure-hardened rod that can survive the trench.',
    icon: '🦈',
    priceCoins: 12_000,
    unlocksSpots: ['abyss'],
  },
  mythic_rod: {
    id: 'mythic_rod',
    name: 'Mythic Rod',
    description: 'A myth-bound rod tuned for frozen currents, storm shelves, and celestial depths.',
    icon: '🌌',
    priceCoins: 35_000,
    unlocksSpots: ['glacier_fjord', 'storm_shelf', 'celestial_reef'],
  },
};

export function createInitialFishingGearState(): FishingGearState {
  return {
    ownedRodIds: [],
    ownedUpgradeIds: [],
    discoveredRareFishIds: [],
    activeUpgradePreset: 'supply',
  };
}
