import { MAX_PLAYER_LEVEL, MAX_SKILL_LEVEL } from '../../data/constants';
import {
  skillEfficiencyMultiplier,
  skillSpeedMultiplier,
  xpForPlayerLevel,
  xpForSkillLevel,
} from '../../data/curves';
import type { PlayerState, SkillDefinition, SkillState } from '../../types';

export interface EffectiveSkillAttributes {
  efficiencyMultiplier: number;
  speedMultiplier: number;
  resourcePerAction: number;
  ticksPerAction: number;
}

export function effectiveAttributeValue(
  baseValue: number,
  bonusValue = 0,
  multiplier = 1,
): number {
  return (baseValue + bonusValue) * multiplier;
}

export function getEffectiveSkillAttributes(
  skill: SkillState,
  definition: SkillDefinition,
): EffectiveSkillAttributes {
  const efficiencyMultiplier = skillEfficiencyMultiplier(skill.level);
  const speedMultiplier = skillSpeedMultiplier(skill.level);

  return {
    efficiencyMultiplier,
    speedMultiplier,
    resourcePerAction: effectiveAttributeValue(
      definition.baseResourcePerAction,
      0,
      efficiencyMultiplier,
    ),
    ticksPerAction: definition.ticksPerAction / speedMultiplier,
  };
}

export function healthMax(
  baseHealth: number,
  bonusHealth = 0,
  multiplier = 1,
): number {
  return Math.floor(effectiveAttributeValue(baseHealth, bonusHealth, multiplier));
}

export function healthPercent(currentHealth: number, maxHealth: number): number {
  if (maxHealth <= 0) return 0;
  return currentHealth / maxHealth;
}

export function skillXpRequired(skill: SkillState): number {
  if (skill.level >= MAX_SKILL_LEVEL) return 0;
  return xpForSkillLevel(skill.level + 1);
}

export function skillXpToNext(skill: SkillState): number {
  const xpRequired = skillXpRequired(skill);
  if (xpRequired === 0) return 0;
  return Math.max(0, xpRequired - skill.xp);
}

export function skillXpProgress(skill: SkillState): number {
  if (skill.level >= MAX_SKILL_LEVEL) return 1;
  const xpRequired = skillXpRequired(skill);
  return xpRequired > 0 ? skill.xp / xpRequired : 0;
}

export function playerXpProgress(player: PlayerState): number {
  if (player.level >= MAX_PLAYER_LEVEL) return 1;
  const xpRequired = xpForPlayerLevel(player.level + 1);
  return xpRequired > 0 ? player.xp / xpRequired : 0;
}
