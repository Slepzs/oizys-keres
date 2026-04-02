import { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot } from '../data/fishing-spots.data';
import { createInitialFishingGearState } from '../data/fishing-rods.data';
import type { FishingSpot } from '../data/fishing-spots.data';
import type { FishingGearState } from '../types/state';
import type { FishingSpotId, SkillState } from '../types/skills';

export { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot };

type FishingSelectionState = Pick<SkillState, 'level' | 'activeFishingSpotId'>;
type FishingGearSelectionState = Pick<FishingGearState, 'ownedRodIds'>;

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
