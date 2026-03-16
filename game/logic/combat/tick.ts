import type { GameState } from '../../types';
import type { CombatState } from '../../types/combat';
import type { ItemId } from '../../types';
import type { GameEvent } from '../../systems/events.types';
import { ENEMY_DEFINITIONS } from '../../data/enemies.data';
import { ZONE_DEFINITIONS } from '../../data/zones.data';
import { ITEM_DEFINITIONS } from '../../data/items.data';
import { isFood } from '../../types/items';
import { removeItemFromBag } from '../bag';
import { getActivePetCombatProfile, getSummoningCombatBonuses, rewardActivePetForCombatKill } from '../summoning';
import {
  calculateDamage,
  calculateCombatLevel,
  calculateMaxHp,
  distributeXpOnKill,
  getPlayerAttackSpeed,
  getPlayerDefense,
  getPlayerRegenAmount,
  getPlayerStrength,
  PLAYER_CRIT_CHANCE,
  ENEMY_CRIT_CHANCE,
  CRIT_DAMAGE_MULTIPLIER,
  REGEN_INTERVAL_MS,
} from './queries';

export interface CombatTickResult {
  state: GameState;
  events: GameEvent[];
}

const MAX_COMBAT_STEPS_PER_TICK = 250;

function getCurrentBonuses(state: GameState) {
  return getSummoningCombatBonuses(state.summoning, state.skills.summoning.level);
}

function getCurrentPet(state: GameState) {
  return getActivePetCombatProfile(state.summoning, state.skills.summoning.level);
}

function ensurePetTimer(combatState: CombatState, hasPet: boolean): CombatState {
  if (!hasPet || !combatState.activeCombat) {
    return combatState;
  }

  if (Number.isFinite(combatState.activeCombat.petNextAttackAt)) {
    return combatState;
  }

  const nextAttackAt = Math.min(
    combatState.activeCombat.playerNextAttackAt,
    combatState.activeCombat.enemyNextAttackAt
  );

  return {
    ...combatState,
    activeCombat: {
      ...combatState.activeCombat,
      petNextAttackAt: nextAttackAt,
    },
  };
}

function handleEnemyKilled(
  state: GameState,
  enemyId: string,
  enemyXpReward: number,
  occurredAt: number,
  events: GameEvent[]
): GameState {
  const xpResult = distributeXpOnKill(
    state.combat.combatSkills,
    enemyXpReward,
    state.combat.trainingMode
  );

  events.push({
    type: 'COMBAT_ENEMY_KILLED',
    enemyId,
    xpReward: enemyXpReward,
  });

  for (const levelUp of xpResult.levelUps) {
    events.push({
      type: 'COMBAT_SKILL_LEVEL_UP',
      skillId: levelUp.skillId,
      newLevel: levelUp.newLevel,
    });
  }

  const petRewardResult = rewardActivePetForCombatKill(
    state.summoning,
    state.skills.summoning.level,
    enemyXpReward
  );
  events.push(...petRewardResult.events);
  const petBonuses = getSummoningCombatBonuses(
    petRewardResult.summoning,
    state.skills.summoning.level
  );
  const newMaxHp = calculateMaxHp(xpResult.skills, petBonuses.maxHpBonus);

  let nextState: GameState = {
    ...state,
    combat: {
      ...state.combat,
      combatSkills: xpResult.skills,
      totalKills: state.combat.totalKills + 1,
      playerMaxHp: newMaxHp,
      playerCurrentHp: Math.min(state.combat.playerCurrentHp, newMaxHp),
    },
    summoning: petRewardResult.summoning,
  };

  if (nextState.combat.autoFight && nextState.combat.selectedZoneId) {
    const selectedZoneId = nextState.combat.selectedZoneId;
    const zone = ZONE_DEFINITIONS[selectedZoneId];
    if (zone && zone.enemies.length > 0) {
      const combatLevel = calculateCombatLevel(nextState.combat.combatSkills);
      const preferredEnemyId = nextState.combat.selectedEnemyByZone[selectedZoneId];
      const candidateEnemyIds = preferredEnemyId
        ? [preferredEnemyId, ...zone.enemies.filter((id) => id !== preferredEnemyId)]
        : zone.enemies;

      const nextEnemyId = candidateEnemyIds.find((candidateEnemyId) => {
        const enemy = ENEMY_DEFINITIONS[candidateEnemyId];
        return !!enemy && combatLevel >= enemy.combatLevelRequired;
      });
      const nextEnemy = nextEnemyId ? ENEMY_DEFINITIONS[nextEnemyId] : null;

      if (nextEnemyId && nextEnemy) {
        const bonuses = getCurrentBonuses(nextState);
        const nextPlayerAttackSpeed = getPlayerAttackSpeed(nextState.combat, bonuses);
        nextState = {
          ...nextState,
          combat: {
            ...nextState.combat,
            activeCombat: {
              zoneId: selectedZoneId,
              enemyId: nextEnemyId,
              enemyCurrentHp: nextEnemy.maxHp,
              playerNextAttackAt: occurredAt + nextPlayerAttackSpeed * 1000,
              enemyNextAttackAt: occurredAt + nextEnemy.attackSpeed * 1000,
              petNextAttackAt: occurredAt,
              playerRegenAt: occurredAt + REGEN_INTERVAL_MS,
            },
          },
        };
        events.push({
          type: 'COMBAT_STARTED',
          zoneId: selectedZoneId,
          enemyId: nextEnemyId,
        });
      } else {
        nextState = {
          ...nextState,
          combat: {
            ...nextState.combat,
            activeCombat: null,
          },
        };
      }
    } else {
      nextState = {
        ...nextState,
        combat: {
          ...nextState.combat,
          activeCombat: null,
        },
      };
    }
  } else {
    nextState = {
      ...nextState,
      combat: {
        ...nextState.combat,
        activeCombat: null,
      },
    };
  }

  return nextState;
}

/**
 * Choose the most efficient food for auto-eat:
 * - prefer the smallest heal that reaches the threshold
 * - otherwise use the largest available heal to climb out of danger
 */
function getAutoEatFood(state: GameState): { itemId: ItemId; healAmount: number } | null {
  const thresholdHp = state.combat.playerMaxHp * state.combat.autoEatThreshold;
  const hpNeeded = Math.max(1, thresholdHp - state.combat.playerCurrentHp);
  let smallestSufficientFood: { itemId: ItemId; healAmount: number } | null = null;
  let largestFood: { itemId: ItemId; healAmount: number } | null = null;

  for (const slot of state.bag.slots) {
    if (!slot) {
      continue;
    }

    const def = ITEM_DEFINITIONS[slot.itemId as ItemId];
    if (!def || !isFood(def)) {
      continue;
    }

    const candidate = { itemId: slot.itemId as ItemId, healAmount: def.healAmount };

    if (!largestFood || candidate.healAmount > largestFood.healAmount) {
      largestFood = candidate;
    }

    if (
      candidate.healAmount >= hpNeeded
      && (!smallestSufficientFood || candidate.healAmount < smallestSufficientFood.healAmount)
    ) {
      smallestSufficientFood = candidate;
    }
  }

  return smallestSufficientFood ?? largestFood;
}

/**
 * Auto-eat until HP is above the configured threshold, or until no food remains.
 */
function tryAutoEat(state: GameState): GameState {
  if (!state.combat.autoEat || state.combat.playerCurrentHp <= 0) {
    return state;
  }

  let current = state;
  const thresholdHp = current.combat.playerMaxHp * current.combat.autoEatThreshold;

  while (current.combat.playerCurrentHp < thresholdHp) {
    const selectedFood = getAutoEatFood(current);
    if (!selectedFood) {
      break;
    }

    const bagResult = removeItemFromBag(current.bag, selectedFood.itemId, 1);
    if (bagResult.removed < 1) {
      break;
    }

    const newHp = Math.min(
      current.combat.playerMaxHp,
      current.combat.playerCurrentHp + selectedFood.healAmount
    );

    current = {
      ...current,
      bag: bagResult.bag,
      combat: {
        ...current.combat,
        playerCurrentHp: newHp,
      },
    };
  }

  return current;
}

/**
 * Process combat forward to `now` using the scheduled attack timestamps in `activeCombat`.
 * This is deterministic and safe for long gaps (offline/background) because it can
 * simulate multiple attacks in one call.
 */
export function processCombatTick(
  state: GameState,
  now: number,
  _ticksElapsed: number
): CombatTickResult {
  const events: GameEvent[] = [];
  let newState = { ...state };

  if (!newState.combat.activeCombat) {
    return { state: newState, events };
  }

  let steps = 0;

  while (newState.combat.activeCombat && steps < MAX_COMBAT_STEPS_PER_TICK) {
    const petProfile = getCurrentPet(newState);
    const bonuses = getCurrentBonuses(newState);

    newState = {
      ...newState,
      combat: ensurePetTimer(newState.combat, !!petProfile),
    };

    const combat = newState.combat.activeCombat;
    if (!combat) {
      break;
    }

    const enemy = ENEMY_DEFINITIONS[combat.enemyId];
    if (!enemy) {
      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          activeCombat: null,
        },
      };
      break;
    }

    const petNextAttackAt = petProfile
      ? (combat.petNextAttackAt ?? Math.min(combat.playerNextAttackAt, combat.enemyNextAttackAt))
      : Number.POSITIVE_INFINITY;
    const regenAt = combat.playerRegenAt ?? Number.POSITIVE_INFINITY;
    const nextEventAt = Math.min(combat.playerNextAttackAt, combat.enemyNextAttackAt, petNextAttackAt, regenAt);
    if (nextEventAt > now) {
      break;
    }

    const isRegen = regenAt <= combat.playerNextAttackAt
      && regenAt <= combat.enemyNextAttackAt
      && regenAt <= petNextAttackAt;
    const isPlayerTurn = !isRegen
      && combat.playerNextAttackAt <= combat.enemyNextAttackAt
      && combat.playerNextAttackAt <= petNextAttackAt;
    const isPetTurn = !isRegen
      && petProfile
      && petNextAttackAt <= combat.playerNextAttackAt
      && petNextAttackAt <= combat.enemyNextAttackAt;

    if (isRegen) {
      const regenAmount = getPlayerRegenAmount(newState.combat);
      const newHp = Math.min(newState.combat.playerMaxHp, newState.combat.playerCurrentHp + regenAmount);
      events.push({
        type: 'COMBAT_PLAYER_REGEN',
        hpRestored: newHp - newState.combat.playerCurrentHp,
        playerHpAfter: newHp,
      });
      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          playerCurrentHp: newHp,
          activeCombat: {
            ...combat,
            playerRegenAt: regenAt + REGEN_INTERVAL_MS,
          },
        },
      };
    } else if (isPlayerTurn) {
      const playerStrength = getPlayerStrength(newState.combat, bonuses);
      const isCritical = Math.random() < PLAYER_CRIT_CHANCE;
      const baseDamagePlayer = calculateDamage(playerStrength, enemy.defense);
      const damage = isCritical ? Math.floor(baseDamagePlayer * CRIT_DAMAGE_MULTIPLIER) : baseDamagePlayer;
      const enemyHpRemaining = Math.max(0, combat.enemyCurrentHp - damage);

      events.push({
        type: 'COMBAT_PLAYER_ATTACK',
        damage,
        enemyHpRemaining,
        isCritical,
      });

      const attackSpeed = getPlayerAttackSpeed(newState.combat, bonuses);
      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          activeCombat: {
            ...combat,
            enemyCurrentHp: enemyHpRemaining,
            playerNextAttackAt: combat.playerNextAttackAt + attackSpeed * 1000,
          },
        },
      };

      if (enemyHpRemaining <= 0) {
        newState = handleEnemyKilled(newState, enemy.id, enemy.xpReward, nextEventAt, events);
      }
    } else if (isPetTurn && petProfile) {
      const missingHpRatio = enemy.maxHp > 0 ? (enemy.maxHp - combat.enemyCurrentHp) / enemy.maxHp : 0;
      const damage = Math.max(
        1,
        Math.floor(petProfile.damage * (1 + missingHpRatio * (petProfile.missingHpDamageMultiplier - 1)))
      );
      const enemyHpRemaining = Math.max(0, combat.enemyCurrentHp - damage);
      events.push({
        type: 'COMBAT_PET_ATTACK',
        petId: petProfile.id,
        damage,
        enemyHpRemaining,
        healAmount: petProfile.healOnAttack,
      });

      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          playerCurrentHp: Math.min(
            newState.combat.playerMaxHp,
            newState.combat.playerCurrentHp + petProfile.healOnAttack
          ),
          activeCombat: {
            ...combat,
            enemyCurrentHp: enemyHpRemaining,
            petNextAttackAt: petNextAttackAt + petProfile.attackIntervalSeconds * 1000,
          },
        },
      };

      if (enemyHpRemaining <= 0) {
        newState = handleEnemyKilled(newState, enemy.id, enemy.xpReward, nextEventAt, events);
      }
    } else {
      const playerDefense = getPlayerDefense(newState.combat, bonuses);
      const baseDamage = calculateDamage(enemy.strength, playerDefense);
      const isCritical = Math.random() < ENEMY_CRIT_CHANCE;
      const damageAfterReduction = Math.max(1, baseDamage - bonuses.damageReduction);
      const damage = isCritical ? Math.floor(damageAfterReduction * CRIT_DAMAGE_MULTIPLIER) : damageAfterReduction;
      const playerHpRemaining = Math.max(0, newState.combat.playerCurrentHp - damage);

      events.push({
        type: 'COMBAT_ENEMY_ATTACK',
        damage,
        playerHpRemaining,
        isCritical,
      });

      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          playerCurrentHp: playerHpRemaining,
          activeCombat: {
            ...combat,
            enemyNextAttackAt: combat.enemyNextAttackAt + enemy.attackSpeed * 1000,
          },
        },
      };

      // Auto-eat: consume food to recover HP if below threshold
      newState = tryAutoEat(newState);

      if (newState.combat.playerCurrentHp <= 0) {
        events.push({ type: 'COMBAT_PLAYER_DIED' });

        const currentBonuses = getCurrentBonuses(newState);
        const maxHp = calculateMaxHp(newState.combat.combatSkills, currentBonuses.maxHpBonus);
        newState = {
          ...newState,
          combat: {
            ...newState.combat,
            playerCurrentHp: maxHp,
            playerMaxHp: maxHp,
            totalDeaths: newState.combat.totalDeaths + 1,
            activeCombat: null,
          },
        };
        break;
      }
    }

    steps += 1;
  }

  return { state: newState, events };
}
