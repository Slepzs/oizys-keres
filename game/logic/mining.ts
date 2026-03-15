import { MINING_ROCKS, getAvailableRocks, getDefaultRock } from '../data/rock-tiers.data';
import type { RockTierId, SkillState } from '../types/skills';

export { MINING_ROCKS, getAvailableRocks, getDefaultRock };

type MiningSelectionState = Pick<SkillState, 'level' | 'activeRockId'>;

export function setActiveMiningRock(skill: SkillState, rockId: RockTierId): SkillState {
  const rock = MINING_ROCKS[rockId];
  if (!rock || skill.level < rock.levelRequired) {
    return skill;
  }
  return {
    ...skill,
    activeRockId: rockId,
  };
}

export function getActiveMiningRock(skill: MiningSelectionState) {
  if (!skill.activeRockId) {
    return getDefaultRock(skill.level);
  }

  const selectedRock = MINING_ROCKS[skill.activeRockId];
  if (!selectedRock || skill.level < selectedRock.levelRequired) {
    return getDefaultRock(skill.level);
  }

  return selectedRock;
}

export function getMiningRocksForLevel(level: number) {
  return getAvailableRocks(level);
}
