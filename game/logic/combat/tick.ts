import type { CombatState } from '../../types/combat';
import type { GameEvent } from '../../systems/events.types';
import { ENEMY_DEFINITIONS } from '../../data/enemies.data';
import { ZONE_DEFINITIONS } from '../../data/zones.data';
import {
  calculateDamage,
  calculateCombatLevel,
  calculateMaxHp,
  distributeXpOnKill,
  getPlayerAttackSpeed,
  getPlayerDefense,
  getPlayerStrength,
} from './queries';

export interface CombatTickResult {
  state: CombatState;
  events: GameEvent[];
}

const MAX_COMBAT_STEPS_PER_TICK = 250;

/**
 * Process combat forward to `now` using the scheduled attack timestamps in `activeCombat`.
 * This is deterministic and safe for long gaps (offline/background) because it can
 * simulate multiple attacks in one call.
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
            const combatLevel = calculateCombatLevel(newState.combatSkills);
            const preferredEnemyId = newState.selectedEnemyByZone[selectedZoneId];
            const candidateEnemyIds = preferredEnemyId
              ? [preferredEnemyId, ...zone.enemies.filter((id) => id !== preferredEnemyId)]
              : zone.enemies;

            const nextEnemyId = candidateEnemyIds.find((id) => {
              const enemy = ENEMY_DEFINITIONS[id];
              return !!enemy && combatLevel >= enemy.combatLevelRequired;
            });

            const nextEnemy = nextEnemyId ? ENEMY_DEFINITIONS[nextEnemyId] : null;

            if (nextEnemyId && nextEnemy) {
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
