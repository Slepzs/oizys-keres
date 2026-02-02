import type { CombatState, EquipmentSlot, TrainingMode } from '../../types/combat';
import type { EquipmentDefinition, ItemId } from '../../types/items';
import { isEquipment } from '../../types/items';
import { ENEMY_DEFINITIONS } from '../../data/enemies.data';
import { ITEM_DEFINITIONS } from '../../data/items.data';
import { ZONE_DEFINITIONS } from '../../data/zones.data';
import { createInitialCombatSkillsState } from '../../data/combat-skills.data';
import { calculateCombatLevel, calculateMaxHp, getPlayerAttackSpeed } from './queries';

/**
 * Start combat in a zone.
 */
export function startCombat(combatState: CombatState, zoneId: string, now: number): CombatState {
  const zone = ZONE_DEFINITIONS[zoneId];
  if (!zone || zone.enemies.length === 0) {
    return combatState;
  }

  const combatLevel = calculateCombatLevel(combatState.combatSkills);
  if (combatLevel < zone.combatLevelRequired) {
    return combatState;
  }

  const preferredEnemyId = combatState.selectedEnemyByZone[zoneId];
  const candidateEnemyIds = preferredEnemyId
    ? [preferredEnemyId, ...zone.enemies.filter((id) => id !== preferredEnemyId)]
    : zone.enemies;

  const enemyId = candidateEnemyIds.find((id) => {
    const enemy = ENEMY_DEFINITIONS[id];
    return !!enemy && combatLevel >= enemy.combatLevelRequired;
  });

  if (!enemyId) {
    return combatState;
  }

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
): { state: CombatState; unequippedItemId: ItemId | null; success: boolean } {
  const item = ITEM_DEFINITIONS[itemId];
  if (!item || !isEquipment(item)) {
    return { state: combatState, unequippedItemId: null, success: false };
  }

  const equipDef = item as EquipmentDefinition;

  if (equipDef.levelRequired) {
    const combatLevel = calculateCombatLevel(combatState.combatSkills);
    if (combatLevel < equipDef.levelRequired) {
      return { state: combatState, unequippedItemId: null, success: false };
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
    success: true,
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
 * Select a zone for combat (without starting combat).
 */
export function selectZone(combatState: CombatState, zoneId: string | null): CombatState {
  return {
    ...combatState,
    selectedZoneId: zoneId,
  };
}

/**
 * Select an enemy to fight in a specific zone (without starting combat).
 */
export function selectEnemyForZone(combatState: CombatState, zoneId: string, enemyId: string): CombatState {
  const zone = ZONE_DEFINITIONS[zoneId];
  if (!zone || zone.enemies.length === 0) {
    return combatState;
  }

  if (!zone.enemies.includes(enemyId)) {
    return combatState;
  }

  return {
    ...combatState,
    selectedEnemyByZone: {
      ...combatState.selectedEnemyByZone,
      [zoneId]: enemyId,
    },
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
    selectedEnemyByZone: {},
    autoFight: false,
    totalKills: 0,
    totalDeaths: 0,
  };
}
