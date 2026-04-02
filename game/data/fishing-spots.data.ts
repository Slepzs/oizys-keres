import { createInitialFishingGearState } from './fishing-rods.data';
import type { FishingGearState } from '../types/state';
import type { ResourceId } from '../types/resources';
import type { ItemId } from '../types/items';
import type { FishingRodId, FishingSpotId, RareFishId } from '../types/skills';

export type FishingSpotRole = 'xp' | 'supply' | 'value' | 'rare';

export type FishingCatchOutput =
  | { kind: 'resource'; resourceId: ResourceId }
  | { kind: 'item'; itemId: ItemId };

export interface FishingCatchTableEntry {
  id: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
  output: FishingCatchOutput;
}

export interface FishingRareFishTableEntry {
  rareFishId: RareFishId;
  chance: number;
}

export interface FishingSpot {
  id: FishingSpotId;
  name: string;
  description: string;
  icon: string;
  role: FishingSpotRole;
  levelRequired: number;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  ticksPerAction: number;
  catchTable: FishingCatchTableEntry[];
  rareFishTable: FishingRareFishTableEntry[];
  requiredRodId?: FishingRodId;
}

export const FISHING_SPOTS: Record<FishingSpotId, FishingSpot> = {
  pond: {
    id: 'pond',
    name: 'Shallow Pond',
    description: 'A calm freshwater pond. Good for beginners.',
    icon: '🪣',
    role: 'xp',
    levelRequired: 1,
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shrimp',
    ticksPerAction: 30,
    catchTable: [
      { id: 'shrimp', weight: 76, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_shrimp' } },
      { id: 'lost-rock', weight: 20, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'rock' } },
      { id: 'pearl', weight: 4, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'pearl' } },
    ],
    rareFishTable: [{ rareFishId: 'golden_minnow', chance: 0.0008 }],
  },
  lake: {
    id: 'lake',
    name: 'Freshwater Lake',
    description: 'A wide lake teeming with sardines.',
    icon: '🌊',
    role: 'supply',
    levelRequired: 10,
    baseXpPerAction: 22,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_sardine',
    ticksPerAction: 36,
    catchTable: [
      { id: 'sardine', weight: 82, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_sardine' } },
      { id: 'shrimp', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_shrimp' } },
      { id: 'lost-rock', weight: 8, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'rock' } },
    ],
    rareFishTable: [],
  },
  river: {
    id: 'river',
    name: 'Mountain River',
    description: 'A fast river where trout are plentiful.',
    icon: '🏞️',
    role: 'xp',
    levelRequired: 20,
    baseXpPerAction: 38,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_trout',
    ticksPerAction: 42,
    catchTable: [
      { id: 'trout', weight: 70, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_trout' } },
      { id: 'tarromin', weight: 12, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'tarromin_herb' } },
      { id: 'sardine', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_sardine' } },
      { id: 'lost-rock', weight: 8, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'rock' } },
    ],
    rareFishTable: [{ rareFishId: 'moon_trout', chance: 0.0006 }],
    requiredRodId: 'river_rod',
  },
  bay: {
    id: 'bay',
    name: 'Coastal Bay',
    description: 'Saltwater fishing for prized salmon.',
    icon: '⚓',
    role: 'supply',
    levelRequired: 35,
    baseXpPerAction: 58,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_salmon',
    ticksPerAction: 48,
    catchTable: [
      { id: 'salmon', weight: 72, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_salmon' } },
      { id: 'oyster', weight: 12, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
      { id: 'harralander', weight: 8, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'harralander_herb' } },
      { id: 'trout', weight: 8, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_trout' } },
    ],
    rareFishTable: [{ rareFishId: 'kingscale_salmon', chance: 0.0005 }],
    requiredRodId: 'river_rod',
  },
  deep_sea: {
    id: 'deep_sea',
    name: 'Deep Sea',
    description: 'Open waters where lobsters lurk on the seabed.',
    icon: '🦞',
    role: 'value',
    levelRequired: 50,
    baseXpPerAction: 85,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_lobster',
    ticksPerAction: 55,
    catchTable: [
      { id: 'lobster', weight: 62, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_lobster' } },
      { id: 'pearl', weight: 16, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'pearl' } },
      { id: 'oyster', weight: 12, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
      { id: 'swordfish', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_swordfish' } },
    ],
    rareFishTable: [],
    requiredRodId: 'deepwater_rod',
  },
  ocean: {
    id: 'ocean',
    name: 'Open Ocean',
    description: 'The vast ocean where swordfish roam.',
    icon: '🌍',
    role: 'supply',
    levelRequired: 65,
    baseXpPerAction: 120,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_swordfish',
    ticksPerAction: 64,
    catchTable: [
      { id: 'swordfish', weight: 70, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_swordfish' } },
      { id: 'lobster', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_lobster' } },
      { id: 'oyster', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
      { id: 'ranarr', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'ranarr_herb' } },
    ],
    rareFishTable: [],
    requiredRodId: 'deepwater_rod',
  },
  abyss: {
    id: 'abyss',
    name: 'Abyssal Trench',
    description: 'The deepest waters. Sharks circle the darkness.',
    icon: '🦈',
    role: 'rare',
    levelRequired: 80,
    baseXpPerAction: 160,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shark',
    ticksPerAction: 75,
    catchTable: [
      { id: 'shark', weight: 74, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_shark' } },
      { id: 'oyster', weight: 14, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
      { id: 'pearl', weight: 12, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'pearl' } },
    ],
    rareFishTable: [{ rareFishId: 'void_lanternfish', chance: 0.00035 }],
    requiredRodId: 'abyssal_rod',
  },
  glacier_fjord: {
    id: 'glacier_fjord',
    name: 'Glacier Fjord',
    description: 'Icy waters packed with heavy coldwater fish for serious provisioning.',
    icon: '🧊',
    role: 'supply',
    levelRequired: 85,
    baseXpPerAction: 180,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_glacier_fish',
    ticksPerAction: 72,
    catchTable: [
      { id: 'glacier-fish', weight: 82, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_glacier_fish' } },
      { id: 'shark', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_shark' } },
      { id: 'oyster', weight: 8, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
    ],
    rareFishTable: [],
    requiredRodId: 'mythic_rod',
  },
  storm_shelf: {
    id: 'storm_shelf',
    name: 'Storm Shelf',
    description: 'Violent seas where valuable trophy tuna cut through the spray.',
    icon: '⛈️',
    role: 'value',
    levelRequired: 92,
    baseXpPerAction: 205,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_stormsnap_tuna',
    ticksPerAction: 68,
    catchTable: [
      { id: 'stormsnap-tuna', weight: 66, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_stormsnap_tuna' } },
      { id: 'pearl', weight: 20, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'pearl' } },
      { id: 'oyster', weight: 14, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
    ],
    rareFishTable: [],
    requiredRodId: 'mythic_rod',
  },
  celestial_reef: {
    id: 'celestial_reef',
    name: 'Celestial Reef',
    description: 'An endgame reef of strange currents and elusive luminous koi.',
    icon: '🌠',
    role: 'rare',
    levelRequired: 99,
    baseXpPerAction: 230,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_celestial_koi',
    ticksPerAction: 82,
    catchTable: [
      { id: 'celestial-koi', weight: 56, minQuantity: 1, maxQuantity: 1, output: { kind: 'resource', resourceId: 'raw_celestial_koi' } },
      { id: 'pearl', weight: 22, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'pearl' } },
      { id: 'oyster', weight: 12, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'oyster' } },
      { id: 'ranarr', weight: 10, minQuantity: 1, maxQuantity: 1, output: { kind: 'item', itemId: 'ranarr_herb' } },
    ],
    rareFishTable: [{ rareFishId: 'starglass_ray', chance: 0.0002 }],
    requiredRodId: 'mythic_rod',
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
