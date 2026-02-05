import type {
  CombatState,
  CombatSkillId,
  CombatSkillsState,
  EquipmentState,
  EquipmentStats,
  TrainingMode,
} from '../../types/combat';
import type { ItemId } from '../../types/items';
import { COMBAT_SKILL_IDS, EQUIPMENT_SLOTS } from '../../types/combat';
import { isEquipment } from '../../types/items';
import { combatSkillLevelFromXp, totalXpForCombatSkillLevel, xpForCombatSkillLevel } from '../../data/curves';
import { ITEM_DEFINITIONS } from '../../data/items.data';

// Base player HP
const BASE_PLAYER_HP = 100;
const HP_PER_DEFENSE_LEVEL = 5;

// Default attack speed (seconds between attacks)
const DEFAULT_ATTACK_SPEED = 2.4;
const COMBAT_XP_REWARD_MULTIPLIER = 1.5;

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
export function calculateMaxHp(combatSkills: CombatSkillsState): number {
  const defenseLevel = getCombatSkillLevel(combatSkills.defense.xp);
  return BASE_PLAYER_HP + (defenseLevel - 1) * HP_PER_DEFENSE_LEVEL;
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

    stats.attackBonus += item.stats.attackBonus;
    stats.strengthBonus += item.stats.strengthBonus;
    stats.defenseBonus += item.stats.defenseBonus;

    // Use weapon attack speed if available
    if (slot === 'weapon' && item.stats.attackSpeed) {
      stats.attackSpeed = item.stats.attackSpeed;
    }
  }

  return stats;
}

/**
 * Get effective player attack (skill level + equipment bonus).
 */
export function getPlayerAttack(combatState: CombatState): number {
  const level = getCombatSkillLevel(combatState.combatSkills.attack.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  return level + equipStats.attackBonus;
}

/**
 * Get effective player strength (skill level + equipment bonus).
 */
export function getPlayerStrength(combatState: CombatState): number {
  const level = getCombatSkillLevel(combatState.combatSkills.strength.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  return level + equipStats.strengthBonus;
}

/**
 * Get effective player defense (skill level + equipment bonus).
 */
export function getPlayerDefense(combatState: CombatState): number {
  const level = getCombatSkillLevel(combatState.combatSkills.defense.xp);
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  return level + equipStats.defenseBonus;
}

/**
 * Get player attack speed in seconds.
 */
export function getPlayerAttackSpeed(combatState: CombatState): number {
  const equipStats = getTotalEquipmentStats(combatState.equipment);
  return equipStats.attackSpeed ?? DEFAULT_ATTACK_SPEED;
}

/**
 * Calculate damage dealt.
 * Damage = max(1, strength - defense)
 */
export function calculateDamage(attackerStrength: number, defenderDefense: number): number {
  return Math.max(1, attackerStrength - defenderDefense);
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
