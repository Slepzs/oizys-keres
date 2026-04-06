import type {
  CombatAbilityEffects,
  CombatAbilityId,
  CombatState,
  EquipmentSlot,
  PotionBuff,
  TrainingMode,
} from '../../types/combat';
import type { EquipmentDefinition, ItemId } from '../../types/items';
import { isEquipment, isPotion } from '../../types/items';
import { ENEMY_DEFINITIONS } from '../../data/enemies.data';
import { ITEM_DEFINITIONS } from '../../data/items.data';
import { COMBAT_ABILITY_DEFINITIONS, createInitialCombatAbilityCooldowns } from '../../data/combat-abilities.data';
import { ZONE_DEFINITIONS } from '../../data/zones.data';
import { createInitialCombatSkillsState } from '../../data/combat-skills.data';
import { calculateCombatLevel, calculateMaxHp, getPlayerAttackSpeed, REGEN_INTERVAL_MS } from './queries';
import { scaleAttackIntervalSeconds, scaleEnemyMaxHp } from './balance';

const RECOVER_HEAL_RATIO = 0.2;

function createInitialCombatAbilityEffects(): CombatAbilityEffects {
  return {
    burstReady: false,
    guardExpiresAt: 0,
  };
}

/**
 * Start combat in a zone.
 */
export function startCombat(
  combatState: CombatState,
  zoneId: string,
  now: number,
  playerAttackSpeedSeconds: number = getPlayerAttackSpeed(combatState)
): CombatState {
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

  return {
    ...combatState,
    selectedZoneId: zoneId,
    activeCombat: {
      zoneId,
      enemyId,
      enemyCurrentHp: scaleEnemyMaxHp(enemy.maxHp),
      playerNextAttackAt: now + playerAttackSpeedSeconds * 1000,
      enemyNextAttackAt: now + scaleAttackIntervalSeconds(enemy.attackSpeed) * 1000,
      petNextAttackAt: now,
      playerRegenAt: now + REGEN_INTERVAL_MS,
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
 * Toggle auto-eat.
 */
export function toggleAutoEat(combatState: CombatState): CombatState {
  return {
    ...combatState,
    autoEat: !combatState.autoEat,
  };
}

/**
 * Toggle auto-drink (automatically drink potions when entering combat).
 */
export function toggleAutoDrink(combatState: CombatState): CombatState {
  return {
    ...combatState,
    autoDrink: !combatState.autoDrink,
  };
}

/**
 * Manually drink a potion from the bag. Adds or overwrites the buff for its type.
 * Returns null bagItem if not found or not a potion.
 */
export function drinkPotion(
  combatState: CombatState,
  itemId: ItemId,
  now: number
): CombatState {
  const item = ITEM_DEFINITIONS[itemId];
  if (!item || !isPotion(item)) {
    return combatState;
  }

  const newBuff: PotionBuff = {
    buffType: item.buffType,
    value: item.buffValue,
    expiresAt: now + item.durationMs,
  };

  // Replace any existing buff of the same type, add the new one
  const filteredBuffs = (combatState.potionBuffs ?? []).filter(
    (b) => b.buffType !== item.buffType
  );

  return {
    ...combatState,
    potionBuffs: [...filteredBuffs, newBuff],
  };
}

export function useCombatAbility(
  combatState: CombatState,
  abilityId: CombatAbilityId,
  now: number
): { state: CombatState; success: boolean } {
  if (!combatState.activeCombat) {
    return { state: combatState, success: false };
  }

  const definition = COMBAT_ABILITY_DEFINITIONS[abilityId];
  if (!definition) {
    return { state: combatState, success: false };
  }

  if ((combatState.abilityCooldowns[abilityId] ?? 0) > now) {
    return { state: combatState, success: false };
  }

  if (abilityId === 'recover' && combatState.playerCurrentHp >= combatState.playerMaxHp) {
    return { state: combatState, success: false };
  }

  const abilityCooldowns = {
    ...combatState.abilityCooldowns,
    [abilityId]: now + definition.cooldownMs,
  };

  if (abilityId === 'burst') {
    return {
      state: {
        ...combatState,
        abilityCooldowns,
        abilityEffects: {
          ...combatState.abilityEffects,
          burstReady: true,
        },
      },
      success: true,
    };
  }

  if (abilityId === 'guard') {
    return {
      state: {
        ...combatState,
        abilityCooldowns,
        abilityEffects: {
          ...combatState.abilityEffects,
          guardExpiresAt: now + 4_000,
        },
      },
      success: true,
    };
  }

  const healAmount = Math.max(1, Math.floor(combatState.playerMaxHp * RECOVER_HEAL_RATIO));

  return {
    state: {
      ...combatState,
      playerCurrentHp: Math.min(combatState.playerMaxHp, combatState.playerCurrentHp + healAmount),
      abilityCooldowns,
    },
    success: true,
  };
}

/**
 * Set auto-eat HP threshold (fraction of max HP, 0.1–1.0).
 */
export function setAutoEatThreshold(combatState: CombatState, threshold: number): CombatState {
  return {
    ...combatState,
    autoEatThreshold: Math.max(0.1, Math.min(1.0, threshold)),
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
    autoEat: false,
    autoEatThreshold: 0.5,
    autoDrink: false,
    potionBuffs: [],
    abilityCooldowns: createInitialCombatAbilityCooldowns(),
    abilityEffects: createInitialCombatAbilityEffects(),
    totalKills: 0,
    enemyKillCounts: {},
    totalDeaths: 0,
  };
}
