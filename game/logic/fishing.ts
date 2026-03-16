import { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot } from '../data/fishing-spots.data';
import type { FishingSpotId, SkillState } from '../types/skills';

export { FISHING_SPOTS, getAvailableFishingSpots, getDefaultFishingSpot };

type FishingSelectionState = Pick<SkillState, 'level' | 'activeFishingSpotId'>;

export function setActiveFishingSpot(skill: SkillState, spotId: FishingSpotId): SkillState {
  const spot = FISHING_SPOTS[spotId];
  if (!spot || skill.level < spot.levelRequired) {
    return skill;
  }
  return {
    ...skill,
    activeFishingSpotId: spotId,
  };
}

export function getActiveFishingSpot(skill: FishingSelectionState) {
  if (!skill.activeFishingSpotId) {
    return getDefaultFishingSpot(skill.level);
  }

  const selectedSpot = FISHING_SPOTS[skill.activeFishingSpotId];
  if (!selectedSpot || skill.level < selectedSpot.levelRequired) {
    return getDefaultFishingSpot(skill.level);
  }

  return selectedSpot;
}

export function getFishingSpotsForLevel(level: number) {
  return getAvailableFishingSpots(level);
}
