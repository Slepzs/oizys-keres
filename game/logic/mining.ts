import { MINING_ROCKS, getAvailableRocks, getDefaultRock } from '../data/rock-tiers.data';
import type { SkillState } from '../types/skills';

export { MINING_ROCKS, getAvailableRocks, getDefaultRock };

export function setActiveMiningRock(skill: SkillState, rockId: string): SkillState {
  const rock = MINING_ROCKS[rockId];
  if (!rock || skill.level < rock.levelRequired) {
    return skill;
  }
  return {
    ...skill,
    activeRockId: rockId,
  };
}

export function getActiveMiningRock(skill: SkillState) {
  if (!skill.activeRockId) {
    return getDefaultRock(skill.level);
  }
  return MINING_ROCKS[skill.activeRockId] || getDefaultRock(skill.level);
}

export function getMiningRocksForLevel(level: number) {
  return getAvailableRocks(level);
}
