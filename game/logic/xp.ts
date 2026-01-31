import { xpForSkillLevel, xpForPlayerLevel } from '../data/curves';
import { MAX_SKILL_LEVEL, MAX_PLAYER_LEVEL } from '../data/constants';
import type { SkillState, PlayerState } from '../types';

export interface XpGainResult {
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Add XP to a skill and calculate level ups.
 */
export function addSkillXp(skill: SkillState, xpGained: number): XpGainResult {
  const startLevel = skill.level;
  let currentXp = skill.xp + xpGained;
  let currentLevel = skill.level;

  // Process level ups
  while (currentLevel < MAX_SKILL_LEVEL) {
    const xpNeeded = xpForSkillLevel(currentLevel + 1);
    if (currentXp >= xpNeeded) {
      currentXp -= xpNeeded;
      currentLevel++;
    } else {
      break;
    }
  }

  // Cap at max level
  if (currentLevel >= MAX_SKILL_LEVEL) {
    currentLevel = MAX_SKILL_LEVEL;
    currentXp = 0; // No overflow XP at max
  }

  return {
    newXp: currentXp,
    newLevel: currentLevel,
    leveledUp: currentLevel > startLevel,
    levelsGained: currentLevel - startLevel,
  };
}

/**
 * Add XP to player and calculate level ups.
 */
export function addPlayerXp(player: PlayerState, xpGained: number): XpGainResult {
  const startLevel = player.level;
  let currentXp = player.xp + xpGained;
  let currentLevel = player.level;

  while (currentLevel < MAX_PLAYER_LEVEL) {
    const xpNeeded = xpForPlayerLevel(currentLevel + 1);
    if (currentXp >= xpNeeded) {
      currentXp -= xpNeeded;
      currentLevel++;
    } else {
      break;
    }
  }

  if (currentLevel >= MAX_PLAYER_LEVEL) {
    currentLevel = MAX_PLAYER_LEVEL;
    currentXp = 0;
  }

  return {
    newXp: currentXp,
    newLevel: currentLevel,
    leveledUp: currentLevel > startLevel,
    levelsGained: currentLevel - startLevel,
  };
}

/**
 * Calculate progress to next level (0-1).
 */
export function skillLevelProgress(skill: SkillState): number {
  if (skill.level >= MAX_SKILL_LEVEL) return 1;
  const xpNeeded = xpForSkillLevel(skill.level + 1);
  return xpNeeded > 0 ? skill.xp / xpNeeded : 0;
}

/**
 * Calculate progress to next player level (0-1).
 */
export function playerLevelProgress(player: PlayerState): number {
  if (player.level >= MAX_PLAYER_LEVEL) return 1;
  const xpNeeded = xpForPlayerLevel(player.level + 1);
  return xpNeeded > 0 ? player.xp / xpNeeded : 0;
}
