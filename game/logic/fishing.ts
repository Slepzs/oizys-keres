import { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot } from '../data/fishing-spots.data';
import { createInitialFishingGearState } from '../data/fishing-rods.data';
import { RARE_FISH_DEFINITIONS } from '../data/rare-fish.data';
import type { FishingSpot } from '../data/fishing-spots.data';
import type { FishingGearState } from '../types/state';
import type { ItemId } from '../types/items';
import type { Multiplier } from '../types/multipliers';
import type { ResourceId } from '../types/resources';
import type { FishingSpotId, SkillState } from '../types/skills';
import { createRng, randomInt, rollChance } from './rng';

export { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot };

type FishingSelectionState = Pick<SkillState, 'level' | 'activeFishingSpotId'>;
type FishingGearSelectionState = Pick<FishingGearState, 'ownedRodIds'>;
type FishingRewardGearState = Pick<
  FishingGearState,
  'ownedUpgradeIds' | 'activeUpgradePreset' | 'discoveredRareFishIds'
>;

interface FishingResourceReward {
  resourceId: ResourceId;
  amount: number;
}

interface FishingItemReward {
  itemId: ItemId;
  quantity: number;
}

export interface ResolveFishingActionsParams {
  spot: FishingSpot;
  actionsCompleted: number;
  rngSeed: number;
  fishingGear: FishingRewardGearState;
}

export interface FishingActionResolution {
  resources: FishingResourceReward[];
  items: FishingItemReward[];
  discoveredRareFishIds: FishingGearState['discoveredRareFishIds'];
  newMultipliers: Multiplier[];
}

function canUseFishingSpot(
  level: number,
  spot: FishingSpot,
  fishingGear: FishingGearSelectionState
): boolean {
  return (
    level >= spot.levelRequired
    && (!spot.requiredRodId || fishingGear.ownedRodIds.includes(spot.requiredRodId))
  );
}

export function setActiveFishingSpot(
  skill: SkillState,
  spotId: FishingSpotId,
  fishingGear: FishingGearSelectionState = createInitialFishingGearState()
): SkillState {
  const spot = FISHING_SPOTS[spotId];
  if (!spot || !canUseFishingSpot(skill.level, spot, fishingGear)) {
    return skill;
  }
  return {
    ...skill,
    activeFishingSpotId: spotId,
  };
}

export function getActiveFishingSpot(
  skill: FishingSelectionState,
  fishingGear: FishingGearSelectionState = createInitialFishingGearState()
) {
  if (!skill.activeFishingSpotId) {
    return getDefaultFishingSpot(skill.level, fishingGear);
  }

  const selectedSpot = FISHING_SPOTS[skill.activeFishingSpotId];
  if (!selectedSpot || !canUseFishingSpot(skill.level, selectedSpot, fishingGear)) {
    return getDefaultFishingSpot(skill.level, fishingGear);
  }

  return selectedSpot;
}

export function getFishingSpotsForLevel(
  level: number,
  fishingGear: FishingGearSelectionState = createInitialFishingGearState()
) {
  return getAvailableFishingSpots(level, fishingGear);
}

function addResourceReward(
  totals: Map<ResourceId, number>,
  resourceId: ResourceId,
  amount: number
) {
  if (amount <= 0) {
    return;
  }
  totals.set(resourceId, (totals.get(resourceId) ?? 0) + amount);
}

function addItemReward(
  totals: Map<ItemId, number>,
  itemId: ItemId,
  quantity: number
) {
  if (quantity <= 0) {
    return;
  }
  totals.set(itemId, (totals.get(itemId) ?? 0) + quantity);
}

function getWeightedFishingCatch(spot: FishingSpot, rng: () => number) {
  const totalWeight = spot.catchTable.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = rng() * totalWeight;

  for (const entry of spot.catchTable) {
    roll -= Math.max(0, entry.weight);
    if (roll < 0) {
      return entry;
    }
  }

  return spot.catchTable[spot.catchTable.length - 1] ?? null;
}

export function resolveFishingActions({
  spot,
  actionsCompleted,
  rngSeed,
  fishingGear,
}: ResolveFishingActionsParams): FishingActionResolution {
  const rng = createRng(rngSeed);
  const resourceTotals = new Map<ResourceId, number>();
  const itemTotals = new Map<ItemId, number>();
  const discovered = new Set(fishingGear.discoveredRareFishIds);
  const newDiscoveries: FishingGearState['discoveredRareFishIds'] = [];
  const newMultipliers: Multiplier[] = [];

  for (let index = 0; index < actionsCompleted; index++) {
    const catchEntry = getWeightedFishingCatch(spot, rng);

    if (catchEntry) {
      const quantity = randomInt(rng, catchEntry.minQuantity, catchEntry.maxQuantity + 1);
      if (catchEntry.output.kind === 'resource') {
        addResourceReward(resourceTotals, catchEntry.output.resourceId, quantity);
      } else {
        addItemReward(itemTotals, catchEntry.output.itemId, quantity);
      }
    } else {
      addResourceReward(resourceTotals, spot.resourceProduced, 1);
    }

    for (const rareEntry of spot.rareFishTable) {
      if (!rollChance(rng, rareEntry.chance)) {
        continue;
      }

      const rareFish = RARE_FISH_DEFINITIONS[rareEntry.rareFishId];
      if (!rareFish) {
        continue;
      }

      if (discovered.has(rareFish.id)) {
        addItemReward(itemTotals, rareFish.duplicateReward.itemId, rareFish.duplicateReward.quantity);
        continue;
      }

      discovered.add(rareFish.id);
      newDiscoveries.push(rareFish.id);
      newMultipliers.push({
        id: `rare_fish:${rareFish.id}`,
        source: 'perk',
        target: rareFish.bonusTarget,
        type: 'additive',
        value: rareFish.bonusValue,
      });
    }
  }

  return {
    resources: Array.from(resourceTotals, ([resourceId, amount]) => ({ resourceId, amount })),
    items: Array.from(itemTotals, ([itemId, quantity]) => ({ itemId, quantity })),
    discoveredRareFishIds: newDiscoveries,
    newMultipliers,
  };
}
