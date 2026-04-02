import {
  COMBAT_DROP_TABLES,
  ENEMY_DEFINITIONS,
  ITEM_DEFINITIONS,
  ZONE_DEFINITIONS,
  getQuestDefinition,
} from '../../data';
import type { GameState } from '../../types';
import type { ItemId } from '../../types/items';
import type { PlayerQuestState } from '../../types/quests';
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
export type CombatPlanningFocus = 'xp' | 'value' | 'safe' | 'quest';

export interface CombatPlanningState {
  bag: GameState['bag'];
  combat: GameState['combat'];
  summoning: GameState['summoning'];
  summoningLevel: number;
  activeQuests?: GameState['quests']['active'];
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

export interface CombatFarmCandidate {
  zoneId: string;
  zoneName: string;
  zoneIcon: string;
  enemyId: string;
  questRoute: CombatQuestRoute | null;
  projection: CombatRouteProjection;
}

export interface CombatFarmPlan {
  focus: CombatPlanningFocus;
  bestRoute: CombatFarmCandidate | null;
  candidates: CombatFarmCandidate[];
  zoneSummaries: Record<string, CombatFarmCandidate>;
  enemyProjections: Record<string, CombatRouteProjection>;
  enemyQuestRoutes: Record<string, CombatQuestRoute | null>;
}

export interface CombatQuestTarget {
  questId: string;
  questName: string;
  questIcon: string;
  objectiveId: string;
  enemyId: string;
  currentKills: number;
  targetKills: number;
  remainingKills: number;
}

export interface CombatQuestRoute {
  enemyId: string;
  questMatches: number;
  killsToComplete: number;
  projectedMinutesToComplete: number | null;
  targets: CombatQuestTarget[];
}

const RISK_PRIORITY: Record<CombatRouteRisk, number> = {
  safe: 3,
  steady: 2,
  risky: 1,
  lethal: 0,
};

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

function getSustainScore(killsBeforeRestock: number | null) {
  return killsBeforeRestock === null ? Number.POSITIVE_INFINITY : killsBeforeRestock;
}

function compareDescending(left: number, right: number) {
  return right - left;
}

function compareAscending(left: number, right: number) {
  return left - right;
}

function compareRisk(left: CombatRouteRisk, right: CombatRouteRisk) {
  return compareDescending(RISK_PRIORITY[left], RISK_PRIORITY[right]);
}

function getQuestMinutesScore(questRoute: CombatQuestRoute | null) {
  if (!questRoute || questRoute.projectedMinutesToComplete === null) {
    return Number.POSITIVE_INFINITY;
  }

  return questRoute.projectedMinutesToComplete;
}

function getActiveKillQuestTargets(activeQuests: PlayerQuestState[] | undefined) {
  const targetsByEnemy: Record<string, CombatQuestTarget[]> = {};

  for (const questState of activeQuests ?? []) {
    if (questState.completed) {
      continue;
    }

    const definition = getQuestDefinition(questState.questId);
    if (!definition) {
      continue;
    }

    for (const objective of definition.objectives) {
      if (objective.type !== 'kill') {
        continue;
      }

      const currentKills = questState.progress[objective.id] ?? 0;
      const remainingKills = Math.max(0, objective.amount - currentKills);
      if (remainingKills <= 0) {
        continue;
      }

      const enemyTargets = targetsByEnemy[objective.target] ?? [];
      enemyTargets.push({
        questId: definition.id,
        questName: definition.name,
        questIcon: definition.icon,
        objectiveId: objective.id,
        enemyId: objective.target,
        currentKills,
        targetKills: objective.amount,
        remainingKills,
      });
      targetsByEnemy[objective.target] = enemyTargets;
    }
  }

  for (const enemyId of Object.keys(targetsByEnemy)) {
    targetsByEnemy[enemyId]!.sort((left, right) => {
      if (left.remainingKills !== right.remainingKills) {
        return left.remainingKills - right.remainingKills;
      }

      return left.questName.localeCompare(right.questName);
    });
  }

  return targetsByEnemy;
}

function getQuestRoute(enemyId: string, projection: CombatRouteProjection, targets: CombatQuestTarget[]) {
  if (targets.length === 0) {
    return null;
  }

  const killsToComplete = targets.reduce((maxRemaining, target) => {
    return Math.max(maxRemaining, target.remainingKills);
  }, 0);
  const killsPerMinute = Number.isFinite(projection.timeToKillSeconds) && projection.timeToKillSeconds > 0
    ? 60 / projection.timeToKillSeconds
    : 0;
  const projectedMinutesToComplete = killsPerMinute > 0
    ? killsToComplete / killsPerMinute
    : null;

  return {
    enemyId,
    questMatches: targets.length,
    killsToComplete,
    projectedMinutesToComplete,
    targets,
  };
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

function compareCombatFarmCandidates(
  left: CombatFarmCandidate,
  right: CombatFarmCandidate,
  focus: CombatPlanningFocus
) {
  const leftViable = left.projection.risk !== 'lethal' ? 1 : 0;
  const rightViable = right.projection.risk !== 'lethal' ? 1 : 0;
  const viabilityComparison = compareDescending(leftViable, rightViable);
  if (viabilityComparison !== 0) {
    return viabilityComparison;
  }

  if (focus === 'quest') {
    const leftQuestScore = left.questRoute ? 1 : 0;
    const rightQuestScore = right.questRoute ? 1 : 0;
    const questPresenceComparison = compareDescending(leftQuestScore, rightQuestScore);
    if (questPresenceComparison !== 0) {
      return questPresenceComparison;
    }

    if (left.questRoute && right.questRoute) {
      const completionComparison = compareAscending(
        getQuestMinutesScore(left.questRoute),
        getQuestMinutesScore(right.questRoute)
      );
      if (completionComparison !== 0) {
        return completionComparison;
      }

      const questMatchesComparison = compareDescending(
        left.questRoute.questMatches,
        right.questRoute.questMatches
      );
      if (questMatchesComparison !== 0) {
        return questMatchesComparison;
      }

      const remainingKillsComparison = compareAscending(
        left.questRoute.killsToComplete,
        right.questRoute.killsToComplete
      );
      if (remainingKillsComparison !== 0) {
        return remainingKillsComparison;
      }
    }

    const riskComparison = compareRisk(left.projection.risk, right.projection.risk);
    if (riskComparison !== 0) {
      return riskComparison;
    }

    const xpComparison = compareDescending(left.projection.xpPerMinute, right.projection.xpPerMinute);
    if (xpComparison !== 0) {
      return xpComparison;
    }

    return compareDescending(left.projection.valuePerMinute, right.projection.valuePerMinute);
  }

  if (focus === 'safe') {
    const riskComparison = compareRisk(left.projection.risk, right.projection.risk);
    if (riskComparison !== 0) {
      return riskComparison;
    }

    const sustainComparison = compareDescending(
      getSustainScore(left.projection.killsBeforeRestock),
      getSustainScore(right.projection.killsBeforeRestock)
    );
    if (sustainComparison !== 0) {
      return sustainComparison;
    }

    const damageComparison = compareAscending(
      left.projection.netDamagePerKill,
      right.projection.netDamagePerKill
    );
    if (damageComparison !== 0) {
      return damageComparison;
    }

    const xpComparison = compareDescending(left.projection.xpPerMinute, right.projection.xpPerMinute);
    if (xpComparison !== 0) {
      return xpComparison;
    }

    return compareDescending(left.projection.valuePerMinute, right.projection.valuePerMinute);
  }

  const primaryComparison = focus === 'xp'
    ? compareDescending(left.projection.xpPerMinute, right.projection.xpPerMinute)
    : compareDescending(left.projection.valuePerMinute, right.projection.valuePerMinute);
  if (primaryComparison !== 0) {
    return primaryComparison;
  }

  const riskComparison = compareRisk(left.projection.risk, right.projection.risk);
  if (riskComparison !== 0) {
    return riskComparison;
  }

  const sustainComparison = compareDescending(
    getSustainScore(left.projection.killsBeforeRestock),
    getSustainScore(right.projection.killsBeforeRestock)
  );
  if (sustainComparison !== 0) {
    return sustainComparison;
  }

  const secondaryComparison = focus === 'xp'
    ? compareDescending(left.projection.valuePerMinute, right.projection.valuePerMinute)
    : compareDescending(left.projection.xpPerMinute, right.projection.xpPerMinute);
  if (secondaryComparison !== 0) {
    return secondaryComparison;
  }

  return compareAscending(left.projection.netDamagePerKill, right.projection.netDamagePerKill);
}

export function rankCombatFarmCandidates(
  candidates: CombatFarmCandidate[],
  focus: CombatPlanningFocus
) {
  return [...candidates].sort((left, right) => compareCombatFarmCandidates(left, right, focus));
}

export function summarizeCombatFarmsByZone(
  candidates: CombatFarmCandidate[],
  focus: CombatPlanningFocus
) {
  const summaries: Record<string, CombatFarmCandidate> = {};

  for (const candidate of rankCombatFarmCandidates(candidates, focus)) {
    if (!summaries[candidate.zoneId]) {
      summaries[candidate.zoneId] = candidate;
    }
  }

  return summaries;
}

export function buildCombatFarmPlan(
  state: CombatPlanningState,
  combatLevel: number,
  focus: CombatPlanningFocus
): CombatFarmPlan {
  const candidates: CombatFarmCandidate[] = [];
  const enemyProjections: Record<string, CombatRouteProjection> = {};
  const enemyQuestRoutes: Record<string, CombatQuestRoute | null> = {};
  const questTargetsByEnemy = getActiveKillQuestTargets(state.activeQuests);

  for (const [zoneId, zone] of Object.entries(ZONE_DEFINITIONS)) {
    if (combatLevel < zone.combatLevelRequired) {
      continue;
    }

    for (const enemyId of zone.enemies) {
      const enemy = ENEMY_DEFINITIONS[enemyId];
      if (!enemy || combatLevel < enemy.combatLevelRequired) {
        continue;
      }

      const projection = estimateCombatRoute(state, enemyId);
      const questRoute = getQuestRoute(enemyId, projection, questTargetsByEnemy[enemyId] ?? []);
      enemyProjections[enemyId] = projection;
      enemyQuestRoutes[enemyId] = questRoute;
      candidates.push({
        zoneId,
        zoneName: zone.name,
        zoneIcon: zone.icon,
        enemyId,
        questRoute,
        projection,
      });
    }
  }

  const rankedCandidates = rankCombatFarmCandidates(candidates, focus);
  const zoneSummaries = summarizeCombatFarmsByZone(candidates, focus);

  return {
    focus,
    bestRoute: rankedCandidates[0] ?? null,
    candidates: rankedCandidates,
    zoneSummaries,
    enemyProjections,
    enemyQuestRoutes,
  };
}
