import {
  BASE_SKILL_XP,
  BASE_PLAYER_XP,
  BASE_PLAYER_HEALTH,
  HEALTH_PER_LEVEL,
  BASE_PLAYER_MANA,
  MANA_PER_LEVEL,
  BASE_HEALTH_REGEN_PER_SECOND,
  HEALTH_REGEN_PER_LEVEL,
  HEALTH_REGEN_FROM_MAX_HEALTH,
  BASE_MANA_REGEN_PER_SECOND,
  MANA_REGEN_PER_LEVEL,
  MANA_REGEN_FROM_MAX_MANA,
} from './constants';

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

function normalizeLevel(level: number): number {
  return Math.max(1, Math.floor(level || 1));
}

/**
 * Calculate max health from player level.
 */
export function playerMaxHealthForLevel(level: number): number {
  const safeLevel = normalizeLevel(level);
  return BASE_PLAYER_HEALTH + (safeLevel - 1) * HEALTH_PER_LEVEL;
}

/**
 * Calculate max mana from player level.
 */
export function playerMaxManaForLevel(level: number): number {
  const safeLevel = normalizeLevel(level);
  return BASE_PLAYER_MANA + (safeLevel - 1) * MANA_PER_LEVEL;
}

/**
 * Calculate health regenerated per second.
 */
export function playerHealthRegenPerSecond(level: number, maxHealth: number): number {
  const safeLevel = normalizeLevel(level);
  const safeMaxHealth = Math.max(1, maxHealth);
  return (
    BASE_HEALTH_REGEN_PER_SECOND +
    (safeLevel - 1) * HEALTH_REGEN_PER_LEVEL +
    safeMaxHealth * HEALTH_REGEN_FROM_MAX_HEALTH
  );
}

/**
 * Calculate mana regenerated per second.
 */
export function playerManaRegenPerSecond(level: number, maxMana: number): number {
  const safeLevel = normalizeLevel(level);
  const safeMaxMana = Math.max(1, maxMana);
  return (
    BASE_MANA_REGEN_PER_SECOND +
    (safeLevel - 1) * MANA_REGEN_PER_LEVEL +
    safeMaxMana * MANA_REGEN_FROM_MAX_MANA
  );
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

// Combat skill XP constants
const BASE_COMBAT_SKILL_XP = 75;

/**
 * Calculate XP required for a combat skill level.
 * Uses polynomial scaling similar to regular skills but slightly steeper.
 */
export function xpForCombatSkillLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_COMBAT_SKILL_XP * Math.pow(level - 1, 1.6));
}

/**
 * Calculate total XP required to reach a combat skill level from level 1.
 */
export function totalXpForCombatSkillLevel(level: number): number {
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += xpForCombatSkillLevel(l);
  }
  return total;
}

/**
 * Calculate combat skill level from total XP.
 * Returns the highest level achieved.
 */
export function combatSkillLevelFromXp(xp: number): number {
  if (!Number.isFinite(xp) || xp < 0) {
    return 1;
  }
  let level = 1;
  let totalRequired = 0;
  while (level < 99) {
    const nextLevelXp = xpForCombatSkillLevel(level + 1);
    if (totalRequired + nextLevelXp > xp) {
      break;
    }
    totalRequired += nextLevelXp;
    level++;
  }
  return level;
}
