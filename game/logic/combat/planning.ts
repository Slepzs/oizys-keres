import { COMBAT_DROP_TABLES, ENEMY_DEFINITIONS, ITEM_DEFINITIONS } from '../../data';
import type { GameState } from '../../types';
import type { ItemId } from '../../types/items';
import { isFood } from '../../types/items';
import { getActivePetCombatProfile, getSummoningCombatBonuses } from '../summoning';
import { scaleAttackIntervalSeconds, scaleEnemyMaxHp } from './balance';
import {
  calculateDamage,
  getPlayerAttackSpeed,
  getPlayerDefense,
  getPlayerRegenAmount,
  getPlayerStrength,
} from './queries';

const REGEN_INTERVAL_SECONDS = 5;
const MIN_DAMAGE_EPSILON = 0.01;

export type CombatRouteRisk = 'safe' | 'steady' | 'risky' | 'lethal';

export interface CombatPlanningState {
  bag: GameState['bag'];
  combat: GameState['combat'];
  summoning: GameState['summoning'];
  summoningLevel: number;
}

export interface CombatRouteProjection {
  enemyId: string;
  enemyName: string;
  timeToKillSeconds: number;
  xpPerMinute: number;
  averageCoinsPerKill: number;
  averageLootValuePerKill: number;
  totalValuePerKill: number;
  valuePerMinute: number;
  playerDps: number;
  petDps: number;
  totalDps: number;
  enemyDps: number;
  netDamagePerKill: number;
  totalFoodCount: number;
  totalHealingStock: number;
  averageFoodHeal: number;
  foodPerKill: number | null;
  killsBeforeRestock: number | null;
  risk: CombatRouteRisk;
  notableDrops: CombatRouteDropProjection[];
}

export interface CombatRouteDropProjection {
  itemId: ItemId;
  name: string;
  icon: string;
  chance: number;
  averageQuantity: number;
  expectedValuePerKill: number;
}

function getFoodStock(bag: GameState['bag']) {
  let totalFoodCount = 0;
  let totalHealingStock = 0;

  for (const slot of bag.slots) {
    if (!slot) {
      continue;
    }

    const definition = ITEM_DEFINITIONS[slot.itemId];
    if (!definition || !isFood(definition)) {
      continue;
    }

    totalFoodCount += slot.quantity;
    totalHealingStock += definition.healAmount * slot.quantity;
  }

  return {
    totalFoodCount,
    totalHealingStock,
    averageFoodHeal: totalFoodCount > 0 ? totalHealingStock / totalFoodCount : 0,
  };
}

function classifyRisk(killsBeforeRestock: number | null, totalDps: number): CombatRouteRisk {
  if (!Number.isFinite(totalDps) || totalDps <= 0) {
    return 'lethal';
  }

  if (killsBeforeRestock === null) {
    return 'safe';
  }

  if (killsBeforeRestock <= 1) {
    return 'lethal';
  }

  if (killsBeforeRestock <= 5) {
    return 'risky';
  }

  if (killsBeforeRestock <= 15) {
    return 'steady';
  }

  return 'safe';
}

function averageRoll(min: number, max: number) {
  return (min + max) / 2;
}

function getLootProjection(enemyId: string) {
  const table = COMBAT_DROP_TABLES[enemyId];

  if (!table) {
    return {
      averageCoinsPerKill: 0,
      averageLootValuePerKill: 0,
      notableDrops: [] as CombatRouteDropProjection[],
    };
  }

  const averageCoinsPerKill = averageRoll(table.coins.min, table.coins.max);
  const notableDrops = table.items
    .map((drop) => {
      const definition = ITEM_DEFINITIONS[drop.itemId];
      const averageQuantity = averageRoll(drop.minQuantity, drop.maxQuantity);
      const expectedValuePerKill = definition
        ? drop.chance * averageQuantity * definition.sellPrice
        : 0;

      return {
        itemId: drop.itemId,
        name: definition?.name ?? drop.itemId,
        icon: definition?.icon ?? '🎒',
        chance: drop.chance,
        averageQuantity,
        expectedValuePerKill,
      };
    })
    .sort((left, right) => {
      if (right.expectedValuePerKill !== left.expectedValuePerKill) {
        return right.expectedValuePerKill - left.expectedValuePerKill;
      }

      return right.chance - left.chance;
    });
  const averageLootValuePerKill = notableDrops.reduce(
    (total, drop) => total + drop.expectedValuePerKill,
    0
  );

  return {
    averageCoinsPerKill,
    averageLootValuePerKill,
    notableDrops: notableDrops.slice(0, 3),
  };
}

export function estimateCombatRoute(
  state: CombatPlanningState,
  enemyId: string
): CombatRouteProjection {
  const enemy = ENEMY_DEFINITIONS[enemyId];

  if (!enemy) {
    return {
      enemyId,
      enemyName: enemyId,
      timeToKillSeconds: Infinity,
      xpPerMinute: 0,
      averageCoinsPerKill: 0,
      averageLootValuePerKill: 0,
      totalValuePerKill: 0,
      valuePerMinute: 0,
      playerDps: 0,
      petDps: 0,
      totalDps: 0,
      enemyDps: 0,
      netDamagePerKill: 0,
      totalFoodCount: 0,
      totalHealingStock: 0,
      averageFoodHeal: 0,
      foodPerKill: null,
      killsBeforeRestock: 0,
      risk: 'lethal',
      notableDrops: [],
    };
  }

  const bonuses = getSummoningCombatBonuses(state.summoning, state.summoningLevel);
  const petProfile = getActivePetCombatProfile(state.summoning, state.summoningLevel);
  const foodStock = getFoodStock(state.bag);
  const lootProjection = getLootProjection(enemy.id);
  const enemyHp = scaleEnemyMaxHp(enemy.maxHp);

  const playerDamagePerHit = calculateDamage(
    getPlayerStrength(state.combat, bonuses),
    enemy.defense
  );
  const playerAttackIntervalSeconds = getPlayerAttackSpeed(state.combat, bonuses);
  const playerDps = playerAttackIntervalSeconds > 0
    ? playerDamagePerHit / playerAttackIntervalSeconds
    : 0;

  const petDamagePerHit = petProfile
    ? petProfile.damage * (1 + (petProfile.missingHpDamageMultiplier - 1) * 0.5)
    : 0;
  const petDps = petProfile && petProfile.attackIntervalSeconds > 0
    ? petDamagePerHit / petProfile.attackIntervalSeconds
    : 0;

  const totalDps = playerDps + petDps;
  const timeToKillSeconds = totalDps > 0 ? enemyHp / totalDps : Infinity;
  const xpPerMinute = Number.isFinite(timeToKillSeconds) && timeToKillSeconds > 0
    ? (enemy.xpReward * 60) / timeToKillSeconds
    : 0;
  const totalValuePerKill =
    lootProjection.averageCoinsPerKill + lootProjection.averageLootValuePerKill;
  const valuePerMinute = Number.isFinite(timeToKillSeconds) && timeToKillSeconds > 0
    ? (totalValuePerKill * 60) / timeToKillSeconds
    : 0;

  const enemyDamagePerHit = Math.max(
    1,
    calculateDamage(enemy.strength, getPlayerDefense(state.combat, bonuses)) - bonuses.damageReduction
  );
  const enemyAttackIntervalSeconds = scaleAttackIntervalSeconds(enemy.attackSpeed);
  const enemyDps = enemyAttackIntervalSeconds > 0
    ? enemyDamagePerHit / enemyAttackIntervalSeconds
    : 0;

  const passiveHealingPerSecond =
    getPlayerRegenAmount(state.combat) / REGEN_INTERVAL_SECONDS
    + (petProfile && petProfile.attackIntervalSeconds > 0 ? petProfile.healOnAttack / petProfile.attackIntervalSeconds : 0);
  const netDamagePerKill = Number.isFinite(timeToKillSeconds)
    ? Math.max(0, (enemyDps - passiveHealingPerSecond) * timeToKillSeconds)
    : Number.POSITIVE_INFINITY;

  const totalSustainPool = state.combat.playerCurrentHp + foodStock.totalHealingStock;
  const killsBeforeRestock = netDamagePerKill <= MIN_DAMAGE_EPSILON
    ? null
    : Math.max(0, Math.floor(totalSustainPool / netDamagePerKill));
  const foodPerKill = foodStock.totalFoodCount > 0
    ? netDamagePerKill / Math.max(1, foodStock.averageFoodHeal)
    : null;

  return {
    enemyId: enemy.id,
    enemyName: enemy.name,
    timeToKillSeconds,
    xpPerMinute,
    averageCoinsPerKill: lootProjection.averageCoinsPerKill,
    averageLootValuePerKill: lootProjection.averageLootValuePerKill,
    totalValuePerKill,
    valuePerMinute,
    playerDps,
    petDps,
    totalDps,
    enemyDps,
    netDamagePerKill,
    totalFoodCount: foodStock.totalFoodCount,
    totalHealingStock: foodStock.totalHealingStock,
    averageFoodHeal: foodStock.averageFoodHeal,
    foodPerKill,
    killsBeforeRestock,
    risk: classifyRisk(killsBeforeRestock, totalDps),
    notableDrops: lootProjection.notableDrops,
  };
}
