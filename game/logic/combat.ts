import type {
  CombatState,
  CombatSkillId,
  CombatSkillsState,
  EquipmentState,
  EquipmentStats,
  TrainingMode,
  EquipmentSlot,
  ActiveCombat,
} from '../types/combat';
import type { ItemId, EquipmentDefinition } from '../types/items';
import type { GameEvent } from '../systems/events.types';
import { combatSkillLevelFromXp, totalXpForCombatSkillLevel, xpForCombatSkillLevel } from '../data/curves';
import { ENEMY_DEFINITIONS } from '../data/enemies.data';
import { ZONE_DEFINITIONS } from '../data/zones.data';
import { ITEM_DEFINITIONS } from '../data/items.data';
import { createInitialCombatSkillsState } from '../data/combat-skills.data';
import { COMBAT_SKILL_IDS, EQUIPMENT_SLOTS } from '../types/combat';
import { isEquipment } from '../types/items';

// Base player HP
const BASE_PLAYER_HP = 100;
const HP_PER_DEFENSE_LEVEL = 5;

// Default attack speed (seconds between attacks)
const DEFAULT_ATTACK_SPEED = 2.4;

export interface CombatTickResult {
  state: CombatState;
  events: GameEvent[];
}

const MAX_COMBAT_STEPS_PER_TICK = 250;

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

  if (trainingMode === 'balanced') {
    // Split evenly between all three skills
    const xpPerSkill = Math.floor(xpReward / 3);
    for (const skillId of COMBAT_SKILL_IDS) {
      const oldXp = newSkills[skillId].xp;
      const newXp = oldXp + xpPerSkill;
      newSkills = {
        ...newSkills,
        [skillId]: { xp: newXp },
      };
      checkLevelUp(skillId, oldXp, newXp);
    }
  } else {
    // All XP goes to selected skill
    const oldXp = newSkills[trainingMode].xp;
    const newXp = oldXp + xpReward;
    newSkills = {
      ...newSkills,
      [trainingMode]: { xp: newXp },
    };
    checkLevelUp(trainingMode, oldXp, newXp);
  }

  return { skills: newSkills, levelUps };
}

/**
 * Process a combat tick. Returns updated combat state and events.
 */
export function processCombatTick(
  combatState: CombatState,
  now: number,
  _ticksElapsed: number
): CombatTickResult {
  const events: GameEvent[] = [];
  let newState: CombatState = { ...combatState };

  if (!newState.activeCombat) {
    return { state: newState, events };
  }

  let steps = 0;

  while (newState.activeCombat && steps < MAX_COMBAT_STEPS_PER_TICK) {
    const combat = newState.activeCombat;
    const enemy = ENEMY_DEFINITIONS[combat.enemyId];
    if (!enemy) {
      newState = { ...newState, activeCombat: null };
      break;
    }

    const nextEventAt = Math.min(combat.playerNextAttackAt, combat.enemyNextAttackAt);
    if (nextEventAt > now) {
      break;
    }

    const isPlayerTurn = combat.playerNextAttackAt <= combat.enemyNextAttackAt;

    if (isPlayerTurn) {
      const playerStrength = getPlayerStrength(newState);
      const damage = calculateDamage(playerStrength, enemy.defense);
      const enemyHpRemaining = Math.max(0, combat.enemyCurrentHp - damage);

      events.push({
        type: 'COMBAT_PLAYER_ATTACK',
        damage,
        enemyHpRemaining,
      });

      const attackSpeed = getPlayerAttackSpeed(newState);

      newState = {
        ...newState,
        activeCombat: {
          ...combat,
          enemyCurrentHp: enemyHpRemaining,
          playerNextAttackAt: combat.playerNextAttackAt + attackSpeed * 1000,
        },
      };

      if (enemyHpRemaining <= 0) {
        const xpResult = distributeXpOnKill(
          newState.combatSkills,
          enemy.xpReward,
          newState.trainingMode
        );

        const newMaxHp = calculateMaxHp(xpResult.skills);

        events.push({
          type: 'COMBAT_ENEMY_KILLED',
          enemyId: enemy.id,
          xpReward: enemy.xpReward,
        });

        for (const levelUp of xpResult.levelUps) {
          events.push({
            type: 'COMBAT_SKILL_LEVEL_UP',
            skillId: levelUp.skillId,
            newLevel: levelUp.newLevel,
          });
        }

        newState = {
          ...newState,
          combatSkills: xpResult.skills,
          totalKills: newState.totalKills + 1,
          playerMaxHp: newMaxHp,
          playerCurrentHp: Math.min(newState.playerCurrentHp, newMaxHp),
        };

        if (newState.autoFight && newState.selectedZoneId) {
          const selectedZoneId = newState.selectedZoneId;
          const zone = ZONE_DEFINITIONS[selectedZoneId];
          if (zone && zone.enemies.length > 0) {
            const nextEnemyId = zone.enemies[0];
            const nextEnemy = ENEMY_DEFINITIONS[nextEnemyId];
            if (nextEnemy) {
              const nextAttackSpeed = getPlayerAttackSpeed(newState);
              newState = {
                ...newState,
                activeCombat: {
                  zoneId: selectedZoneId,
                  enemyId: nextEnemyId,
                  enemyCurrentHp: nextEnemy.maxHp,
                  playerNextAttackAt: nextEventAt + nextAttackSpeed * 1000,
                  enemyNextAttackAt: nextEventAt + nextEnemy.attackSpeed * 1000,
                },
              };
              events.push({
                type: 'COMBAT_STARTED',
                zoneId: selectedZoneId,
                enemyId: nextEnemyId,
              });
            } else {
              newState = { ...newState, activeCombat: null };
            }
          } else {
            newState = { ...newState, activeCombat: null };
          }
        } else {
          newState = { ...newState, activeCombat: null };
        }
      }
    } else {
      const playerDefense = getPlayerDefense(newState);
      const damage = calculateDamage(enemy.strength, playerDefense);
      const playerHpRemaining = Math.max(0, newState.playerCurrentHp - damage);

      events.push({
        type: 'COMBAT_ENEMY_ATTACK',
        damage,
        playerHpRemaining,
      });

      newState = {
        ...newState,
        playerCurrentHp: playerHpRemaining,
        activeCombat: {
          ...combat,
          enemyNextAttackAt: combat.enemyNextAttackAt + enemy.attackSpeed * 1000,
        },
      };

      if (playerHpRemaining <= 0) {
        events.push({ type: 'COMBAT_PLAYER_DIED' });

        const maxHp = calculateMaxHp(newState.combatSkills);
        newState = {
          ...newState,
          playerCurrentHp: maxHp,
          playerMaxHp: maxHp,
          totalDeaths: newState.totalDeaths + 1,
          activeCombat: null,
        };
        break;
      }
    }

    steps += 1;
  }

  return { state: newState, events };
}

/**
 * Start combat in a zone.
 */
export function startCombat(
  combatState: CombatState,
  zoneId: string,
  now: number
): CombatState {
  const zone = ZONE_DEFINITIONS[zoneId];
  if (!zone || zone.enemies.length === 0) {
    return combatState;
  }

  // Check combat level requirement
  const combatLevel = calculateCombatLevel(combatState.combatSkills);
  if (combatLevel < zone.combatLevelRequired) {
    return combatState;
  }

  const enemyId = zone.enemies[0]; // Use first enemy in zone
  const enemy = ENEMY_DEFINITIONS[enemyId];
  if (!enemy) {
    return combatState;
  }

  const attackSpeed = getPlayerAttackSpeed(combatState);

  return {
    ...combatState,
    selectedZoneId: zoneId,
    activeCombat: {
      zoneId,
      enemyId,
      enemyCurrentHp: enemy.maxHp,
      playerNextAttackAt: now + attackSpeed * 1000,
      enemyNextAttackAt: now + enemy.attackSpeed * 1000,
    },
  };
}

/**
 * Flee from combat.
 */
export function fleeCombat(combatState: CombatState): CombatState {
  return {
    ...combatState,
    activeCombat: null,
  };
}

/**
 * Set training mode.
 */
export function setTrainingMode(combatState: CombatState, mode: TrainingMode): CombatState {
  return {
    ...combatState,
    trainingMode: mode,
  };
}

/**
 * Toggle auto-fight.
 */
export function toggleAutoFight(combatState: CombatState): CombatState {
  return {
    ...combatState,
    autoFight: !combatState.autoFight,
  };
}

/**
 * Equip an item from the bag.
 */
export function equipItem(
  combatState: CombatState,
  itemId: ItemId
): { state: CombatState; unequippedItemId: ItemId | null } {
  const item = ITEM_DEFINITIONS[itemId];
  if (!item || !isEquipment(item)) {
    return { state: combatState, unequippedItemId: null };
  }

  const equipDef = item as EquipmentDefinition;

  // Check level requirement
  if (equipDef.levelRequired) {
    const combatLevel = calculateCombatLevel(combatState.combatSkills);
    if (combatLevel < equipDef.levelRequired) {
      return { state: combatState, unequippedItemId: null };
    }
  }

  const slot = equipDef.slot;
  const currentlyEquipped = combatState.equipment[slot];

  return {
    state: {
      ...combatState,
      equipment: {
        ...combatState.equipment,
        [slot]: itemId,
      },
    },
    unequippedItemId: currentlyEquipped as ItemId | null,
  };
}

/**
 * Unequip an item from a slot.
 */
export function unequipSlot(
  combatState: CombatState,
  slot: EquipmentSlot
): { state: CombatState; unequippedItemId: ItemId | null } {
  const currentlyEquipped = combatState.equipment[slot];

  return {
    state: {
      ...combatState,
      equipment: {
        ...combatState.equipment,
        [slot]: null,
      },
    },
    unequippedItemId: currentlyEquipped as ItemId | null,
  };
}

/**
 * Create initial combat state for new players.
 */
export function createInitialCombatState(): CombatState {
  const combatSkills = createInitialCombatSkillsState();
  const maxHp = calculateMaxHp(combatSkills);

  return {
    combatSkills,
    equipment: {
      weapon: null,
      helmet: null,
      chest: null,
      legs: null,
      boots: null,
      accessory: null,
    },
    activeCombat: null,
    trainingMode: 'balanced',
    playerCurrentHp: maxHp,
    playerMaxHp: maxHp,
    selectedZoneId: null,
    autoFight: false,
    totalKills: 0,
    totalDeaths: 0,
  };
}

/**
 * Select a zone for combat (without starting combat).
 */
export function selectZone(combatState: CombatState, zoneId: string | null): CombatState {
  return {
    ...combatState,
    selectedZoneId: zoneId,
  };
}
