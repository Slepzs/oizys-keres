import { BASE_SKILL_XP, BASE_PLAYER_XP } from './constants';

/**
 * Calculate XP required for a skill level.
 * Uses polynomial scaling: base * level^1.5
 */
export function xpForSkillLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_SKILL_XP * Math.pow(level - 1, 1.5));
}

/**
 * Calculate total XP required to reach a skill level from level 1.
 */
export function totalXpForSkillLevel(level: number): number {
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForSkillLevel(l);
  }
  return total;
}

/**
 * Calculate XP required for a player level.
 * Uses steeper scaling: base * level^2
 */
export function xpForPlayerLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_PLAYER_XP * Math.pow(level - 1, 2));
}

/**
 * Calculate skill efficiency multiplier based on level.
 * Higher levels = more resources per action.
 */
export function skillEfficiencyMultiplier(level: number): number {
  return 1 + (level - 1) * 0.02; // 2% increase per level
}

/**
 * Calculate skill speed multiplier based on level.
 * Higher levels = faster actions.
 */
export function skillSpeedMultiplier(level: number): number {
  return 1 + (level - 1) * 0.01; // 1% faster per level
}
