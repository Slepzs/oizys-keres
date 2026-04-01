import type {
  CombatState,
  CombatSkillId,
  CombatSkillsState,
  EquipmentState,
  EquipmentStats,
  TrainingMode,
} from '../../types/combat';
import type { ItemId } from '../../types/items';
import type { SummoningCombatBonuses } from '../../types/summoning';
import { COMBAT_SKILL_IDS, EQUIPMENT_SLOTS } from '../../types/combat';
import { isEquipment } from '../../types/items';
import { combatSkillLevelFromXp, totalXpForCombatSkillLevel, xpForCombatSkillLevel } from '../../data/curves';
import { ITEM_DEFINITIONS } from '../../data/items.data';
import { calculateScaledCombatDamage, scaleAttackIntervalSeconds, scaleCombatOffenseBonus } from './balance';

// Base player HP
const BASE_PLAYER_HP = 100;
const HP_PER_DEFENSE_LEVEL = 5;

// Default attack speed (seconds between attacks)
const DEFAULT_ATTACK_SPEED = 2.4;
const COMBAT_XP_REWARD_MULTIPLIER = 1.5;

// Critical hit constants
export const PLAYER_CRIT_CHANCE = 0.15;
export const ENEMY_CRIT_CHANCE = 0.10;
export const CRIT_DAMAGE_MULTIPLIER = 2.0;

// HP regeneration (ms between regen ticks)
export const REGEN_INTERVAL_MS = 5000;

/**
 * Get combat skill level from XP.
 */
export function getCombatSkillLevel(xp: number): number {
  return combatSkillLevelFromXp(xp);
}

/**
 * Get XP progress within current level.
 */
export function getCombatSkillXpProgress(xp: number): { current: number; required: number; progress: number } {
  if (!Number.isFinite(xp)) {
    return { current: 0, required: 1, progress: 0 };
  }
  const level = getCombatSkillLevel(xp);
  const xpForCurrent = totalXpForCombatSkillLevel(level);
  const xpForNext = xpForCombatSkillLevel(level + 1);
  const current = xp - xpForCurrent;
  const progress = xpForNext > 0 ? current / xpForNext : 1;
  return { current, required: xpForNext, progress };
}

/**
 * Calculate combat level as floor of average of attack, strength, and defense.
 */
export function calculateCombatLevel(combatSkills: CombatSkillsState): number {
  const attackLevel = getCombatSkillLevel(combatSkills.attack.xp);
  const strengthLevel = getCombatSkillLevel(combatSkills.strength.xp);
  const defenseLevel = getCombatSkillLevel(combatSkills.defense.xp);
  return Math.floor((attackLevel + strengthLevel + defenseLevel) / 3);
}

/**
 * Calculate max HP based on defense level.
 */
export function calculateMaxHp(
  combatSkills: CombatSkillsState,
  bonusMaxHp: number = 0
): number {
  const defenseLevel = getCombatSkillLevel(combatSkills.defense.xp);
  return BASE_PLAYER_HP + (defenseLevel - 1) * HP_PER_DEFENSE_LEVEL + bonusMaxHp;
}

/**
 * Get total equipment stats from equipped items.
 */
export function getTotalEquipmentStats(equipment: EquipmentState): EquipmentStats {
  const stats: EquipmentStats = {
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0,
    attackSpeed: undefined,
  };

  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = equipment[slot];
    if (!itemId) continue;

    const item = ITEM_DEFINITIONS[itemId as ItemId];
    if (!item || !isEquipment(item)) continue;

    stats.attackBonus += scaleCombatOffenseBonus(item.stats.attackBonus);
    stats.strengthBonus += scaleCombatOffenseBonus(item.stats.strengthBonus);
    stats.defenseBonus += item.stats.defenseBonus;

    // Use weapon attack speed if available
    if (slot === 'weapon' && item.stats.attackSpeed) {
      stats.attackSpeed = item.stats.attackSpeed;
    }
  }

  return stats;
}

/**
 * Sum active potion buffs of a given type (already pre-filtered for expiry).
 */
function getPotionBonus(combatState: CombatState, buffType: import('../../types/combat').PotionBuffType): number {
  return (combatState.potionBuffs ?? [])
    .filter((b) => b.buffType === buffType)
    .reduce((sum, b) => sum + b.value, 0);
}

/**
 * Get effective player attack (skill level + equipment bonus + potion bonus).
 */
export function getPlayerAttack(
  combatState: CombatState,
  bonuses?: Pick<SummoningCombatBonuses, 'attackBonus'>
): number {
  const level = getCombatSkillLevel(combatState.combatSkills.attack.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  const potionBonus = getPotionBonus(combatState, 'attack');
  return level + equipStats.attackBonus + (bonuses?.attackBonus ?? 0) + potionBonus;
}

/**
 * Get effective player strength (skill level + equipment bonus + potion bonus).
 */
export function getPlayerStrength(
  combatState: CombatState,
  bonuses?: Pick<SummoningCombatBonuses, 'strengthBonus'>
): number {
  const level = getCombatSkillLevel(combatState.combatSkills.strength.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  const potionBonus = getPotionBonus(combatState, 'strength');
  return level + equipStats.strengthBonus + (bonuses?.strengthBonus ?? 0) + potionBonus;
}

/**
 * Get effective player defense (skill level + equipment bonus + potion bonus).
 */
export function getPlayerDefense(
  combatState: CombatState,
  bonuses?: Pick<SummoningCombatBonuses, 'defenseBonus'>
): number {
  const level = getCombatSkillLevel(combatState.combatSkills.defense.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  const potionBonus = getPotionBonus(combatState, 'defence');
  return level + equipStats.defenseBonus + (bonuses?.defenseBonus ?? 0) + potionBonus;
}

/**
 * Get player attack speed in seconds.
 */
export function getPlayerAttackSpeed(
  combatState: CombatState,
  bonuses?: Pick<SummoningCombatBonuses, 'attackSpeedMultiplier'>
): number {
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  const baseAttackSpeed = equipStats.attackSpeed ?? DEFAULT_ATTACK_SPEED;
  const multiplier = bonuses?.attackSpeedMultiplier ?? 1;
  return Math.max(1.5, scaleAttackIntervalSeconds(baseAttackSpeed / Math.max(0.25, multiplier)));
}

/**
 * Get HP regenerated per regen tick.
 * Base 1 HP + 1 per 10 defense levels.
 */
export function getPlayerRegenAmount(combatState: CombatState): number {
  const defenseLevel = getCombatSkillLevel(combatState.combatSkills.defense.xp);
  return 1 + Math.floor(defenseLevel / 10);
}

/**
 * Calculate damage dealt.
 * Damage = max(1, strength - defense)
 */
export function calculateDamage(attackerStrength: number, defenderDefense: number): number {
  return calculateScaledCombatDamage(attackerStrength, defenderDefense);
}

/**
 * Distribute XP based on training mode.
 */
export function distributeXpOnKill(
  combatSkills: CombatSkillsState,
  xpReward: number,
  trainingMode: TrainingMode
): { skills: CombatSkillsState; levelUps: { skillId: CombatSkillId; newLevel: number }[] } {
  const levelUps: { skillId: CombatSkillId; newLevel: number }[] = [];
  let newSkills = { ...combatSkills };

  const checkLevelUp = (skillId: CombatSkillId, oldXp: number, newXp: number) => {
    const oldLevel = getCombatSkillLevel(oldXp);
    const newLevel = getCombatSkillLevel(newXp);
    if (newLevel > oldLevel) {
      levelUps.push({ skillId, newLevel });
    }
  };

  const adjustedXpReward = Math.max(1, Math.floor(xpReward * COMBAT_XP_REWARD_MULTIPLIER));

  if (trainingMode === 'balanced') {
    const skillCount = COMBAT_SKILL_IDS.length;
    const xpPerSkill = Math.floor(adjustedXpReward / skillCount);
    let remainder = adjustedXpReward - xpPerSkill * skillCount;

    for (const skillId of COMBAT_SKILL_IDS) {
      const extraXp = remainder > 0 ? 1 : 0;
      if (remainder > 0) {
        remainder -= 1;
      }

      const oldXp = newSkills[skillId].xp;
      const newXp = oldXp + xpPerSkill + extraXp;
      newSkills = {
        ...newSkills,
        [skillId]: { xp: newXp },
      };
      checkLevelUp(skillId, oldXp, newXp);
    }
  } else {
    const oldXp = newSkills[trainingMode].xp;
    const newXp = oldXp + adjustedXpReward;
    newSkills = {
      ...newSkills,
      [trainingMode]: { xp: newXp },
    };
    checkLevelUp(trainingMode, oldXp, newXp);
  }

  return { skills: newSkills, levelUps };
}
