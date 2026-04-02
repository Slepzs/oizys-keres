import {
  COMPLETION_FINAL_CONTRACT_IDS,
  COMPLETION_FINAL_HUNTS,
  COMPLETION_LORE,
  COMPLETION_TARGETS,
  ENEMY_DEFINITIONS,
  ITEM_DEFINITIONS,
  getQuestDefinition,
  ZONE_DEFINITIONS,
} from '@/game/data';
import type { GameState } from '@/game/types';
import type { Objective, PlayerQuestState, QuestCondition } from '@/game/types/quests';

import { countItemInBag } from './bag';
import { calculateCombatLevel } from './combat';

type CompletionState = Pick<GameState, 'player' | 'combat' | 'quests' | 'bag'>;
type CompletionQuestStatus = 'completed' | 'active' | 'available' | 'locked';

interface ProgressMetric {
  current: number;
  target: number;
  progress: number;
}

interface CompletionContractEntry {
  questId: string;
  name: string;
  icon: string;
  description: string;
  completed: boolean;
  status: CompletionQuestStatus;
}

interface CompletionHuntEntry {
  enemyId: string;
  enemyName: string;
  enemyIcon: string;
  zoneId: string;
  zoneName: string;
  combatLevelRequired: number;
  kills: number;
  unlocked: boolean;
  questId: string;
  questName: string;
  questCompleted: boolean;
  questStatus: CompletionQuestStatus;
  questKillProgress: {
    current: number;
    target: number;
    remaining: number;
  };
}

interface CompletionRecommendation {
  kind:
    | 'start-contract'
    | 'hunt-contract'
    | 'train-combat'
    | 'finish-ascension'
    | 'complete-ledger';
  title: string;
  detail: string;
  actionLabel: string;
  questId?: string;
  enemyId?: string;
  zoneId?: string;
}

interface QuestHuntRoute {
  enemyId: string;
  enemyName: string;
  zoneId: string;
  zoneName: string;
  combatLevelRequired: number;
}

export interface CompletionProgress {
  lore: typeof COMPLETION_LORE;
  ascension: {
    player: ProgressMetric;
    combat: ProgressMetric;
  };
  realm: {
    quests: ProgressMetric;
    kills: ProgressMetric;
    zones: ProgressMetric;
  };
  finalContracts: {
    completedCount: number;
    total: number;
    entries: CompletionContractEntry[];
  };
  finalHunts: CompletionHuntEntry[];
  recommendation: CompletionRecommendation;
}

function buildMetric(current: number, target: number): ProgressMetric {
  const safeTarget = Math.max(1, target);

  return {
    current,
    target,
    progress: Math.max(0, Math.min(1, current / safeTarget)),
  };
}

function evaluateQuestUnlockCondition(
  condition: QuestCondition,
  state: CompletionState,
  completedQuestIds: Set<string>
) {
  switch (condition.type) {
    case 'quest_completed':
      return completedQuestIds.has(condition.questId);
    case 'player_level_at_least':
      return state.player.level >= condition.value;
    default:
      return false;
  }
}

function getCompletionQuestStatus(
  questId: string,
  state: CompletionState,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): CompletionQuestStatus {
  if (completedQuestIds.has(questId)) {
    return 'completed';
  }

  if (activeQuestById.has(questId)) {
    return 'active';
  }

  const definition = getQuestDefinition(questId);
  if (!definition?.unlock?.length) {
    return 'available';
  }

  const unlocked = definition.unlock.every((condition) =>
    evaluateQuestUnlockCondition(condition, state, completedQuestIds)
  );

  return unlocked ? 'available' : 'locked';
}

function getKillObjective(
  objectives: Objective[],
  enemyId: string
): Extract<Objective, { type: 'kill' }> | null {
  return objectives.find(
    (objective): objective is Extract<Objective, { type: 'kill' }> =>
      objective.type === 'kill' && objective.target === enemyId
  ) ?? null;
}

function getQuestHuntRoute(questId: string): QuestHuntRoute | null {
  const definition = getQuestDefinition(questId);
  const killObjective = definition?.objectives.find(
    (objective): objective is Extract<Objective, { type: 'kill' }> => objective.type === 'kill'
  );

  if (!killObjective) {
    return null;
  }

  const enemy = ENEMY_DEFINITIONS[killObjective.target];
  const zoneEntry = Object.entries(ZONE_DEFINITIONS).find(([, zone]) =>
    zone.enemies.includes(killObjective.target)
  );

  if (!enemy || !zoneEntry) {
    return null;
  }

  const [zoneId, zone] = zoneEntry;

  return {
    enemyId: killObjective.target,
    enemyName: enemy.name,
    zoneId,
    zoneName: zone.name,
    combatLevelRequired: Math.max(zone.combatLevelRequired, enemy.combatLevelRequired),
  };
}

function getObjectiveCurrent(
  objective: Objective,
  activeQuestState: PlayerQuestState | undefined,
  state: CompletionState
) {
  if (objective.type === 'have_item' || objective.type === 'collect_item') {
    return countItemInBag(state.bag, objective.target);
  }

  return activeQuestState?.progress[objective.id] ?? 0;
}

function pluralize(label: string, amount: number) {
  return amount === 1 ? label : `${label}s`;
}

function getRemainingObjectiveLabels(
  questId: string,
  activeQuestState: PlayerQuestState | undefined,
  state: CompletionState
) {
  const definition = getQuestDefinition(questId);

  if (!definition) {
    return [];
  }

  return definition.objectives.flatMap((objective) => {
    let target = 0;

    switch (objective.type) {
      case 'gain_xp':
      case 'gain_resource':
      case 'collect_item':
      case 'have_item':
      case 'kill':
      case 'craft':
        target = objective.amount;
        break;
      case 'reach_level':
        target = objective.level;
        break;
      case 'timer':
        target = objective.durationMs;
        break;
      default:
        target = 0;
    }

    const current = Math.min(getObjectiveCurrent(objective, activeQuestState, state), target);
    const remaining = Math.max(0, target - current);

    if (remaining <= 0) {
      return [];
    }

    switch (objective.type) {
      case 'kill':
        return [`${remaining} ${pluralize('kill', remaining)}`];
      case 'have_item':
      case 'collect_item': {
        const itemName = ITEM_DEFINITIONS[objective.target]?.name.toLowerCase() ?? objective.target;
        return [`${remaining} ${pluralize(itemName, remaining)}`];
      }
      case 'gain_resource':
        return [`${remaining} ${objective.target.replaceAll('_', ' ')}`];
      case 'gain_xp':
        return [`${remaining} ${objective.target} xp`];
      case 'reach_level':
        return [`${remaining} ${pluralize('level', remaining)}`];
      case 'craft': {
        const itemName = ITEM_DEFINITIONS[objective.target]?.name.toLowerCase() ?? objective.target;
        return [`craft ${remaining} ${pluralize(itemName, remaining)}`];
      }
      case 'timer':
        return ['more time remaining'];
      default:
        return [];
    }
  });
}

function formatRemainingObjectives(labels: string[]) {
  if (labels.length === 0) {
    return 'Contract ready to claim';
  }

  if (labels.length === 1) {
    return `${labels[0]} remaining`;
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]} remaining`;
  }

  const allButLast = labels.slice(0, -1).join(', ');
  const last = labels[labels.length - 1];
  return `${allButLast}, and ${last} remaining`;
}

function getAscensionRecommendation(progress: CompletionProgress): CompletionRecommendation {
  const candidates = [
    {
      key: 'player',
      label: 'player level',
      metric: progress.ascension.player,
    },
    {
      key: 'combat',
      label: 'combat level',
      metric: progress.ascension.combat,
    },
    {
      key: 'quests',
      label: 'quest completions',
      metric: progress.realm.quests,
    },
    {
      key: 'kills',
      label: 'total kills',
      metric: progress.realm.kills,
    },
    {
      key: 'zones',
      label: 'zones unlocked',
      metric: progress.realm.zones,
    },
  ].filter((candidate) => candidate.metric.progress < 1);

  if (candidates.length === 0) {
    return {
      kind: 'complete-ledger',
      title: 'Last Ledger Closed',
      detail: 'Every tracked completion target is done.',
      actionLabel: 'System complete',
    };
  }

  const nextMetric = candidates.sort((left, right) => left.metric.progress - right.metric.progress)[0];
  const remaining = Math.max(0, nextMetric.metric.target - nextMetric.metric.current);

  return {
    kind: 'finish-ascension',
    title: `Push ${nextMetric.label}`,
    detail: `${nextMetric.metric.current}/${nextMetric.metric.target} recorded toward the final ledger.`,
    actionLabel: `${remaining.toLocaleString()} remaining`,
  };
}

function buildCompletionRecommendation(
  state: CompletionState,
  finalContracts: CompletionContractEntry[],
  finalHunts: CompletionHuntEntry[],
  activeQuestById: Map<string, PlayerQuestState>
): CompletionRecommendation | null {
  const nextContract = finalContracts.find((entry) => entry.status !== 'completed');

  if (!nextContract) {
    return null;
  }

  const linkedHunt = finalHunts.find((hunt) => hunt.questId === nextContract.questId);
  const questHuntRoute = linkedHunt
    ? {
        enemyId: linkedHunt.enemyId,
        enemyName: linkedHunt.enemyName,
        zoneId: linkedHunt.zoneId,
        zoneName: linkedHunt.zoneName,
        combatLevelRequired: linkedHunt.combatLevelRequired,
      }
    : getQuestHuntRoute(nextContract.questId);

  if (nextContract.status === 'available') {
    return {
      kind: 'start-contract',
      title: `Start ${nextContract.name}`,
      detail: questHuntRoute
        ? `Return to the ${questHuntRoute.zoneName} and reopen the ${questHuntRoute.enemyName.toLowerCase()} hunt.`
        : nextContract.description,
      actionLabel: 'Next final contract',
      questId: nextContract.questId,
      enemyId: questHuntRoute?.enemyId,
      zoneId: questHuntRoute?.zoneId,
    };
  }

  if (nextContract.status === 'active' && questHuntRoute) {
    if (calculateCombatLevel(state.combat.combatSkills) < questHuntRoute.combatLevelRequired) {
      return {
        kind: 'train-combat',
        title: `Reach combat level ${questHuntRoute.combatLevelRequired}`,
        detail: `${nextContract.name} is active, but ${questHuntRoute.enemyName} in ${questHuntRoute.zoneName} is still locked.`,
        actionLabel: 'Unlock the next final hunt',
        questId: nextContract.questId,
        enemyId: questHuntRoute.enemyId,
        zoneId: questHuntRoute.zoneId,
      };
    }

    const remainingObjectives = getRemainingObjectiveLabels(
      nextContract.questId,
      activeQuestById.get(nextContract.questId),
      state
    );

    return {
      kind: 'hunt-contract',
      title: `Hunt ${questHuntRoute.enemyName}`,
      detail: `${nextContract.name} is active in ${questHuntRoute.zoneName}.`,
      actionLabel: formatRemainingObjectives(remainingObjectives),
      questId: nextContract.questId,
      enemyId: questHuntRoute.enemyId,
      zoneId: questHuntRoute.zoneId,
    };
  }

  return {
    kind: 'start-contract',
    title: `Start ${nextContract.name}`,
    detail: nextContract.description,
    actionLabel: 'Next final contract',
    questId: nextContract.questId,
  };
}

export function getCompletionProgress(state: CompletionState): CompletionProgress {
  const completedQuestIds = new Set(state.quests.completed);
  const activeQuestById = new Map(
    state.quests.active.map((questState) => [questState.questId, questState] as const)
  );
  const combatLevel = calculateCombatLevel(state.combat.combatSkills);
  const unlockedZones = Object.values(ZONE_DEFINITIONS).filter((zone) => {
    return combatLevel >= zone.combatLevelRequired;
  }).length;

  const finalContracts = COMPLETION_FINAL_CONTRACT_IDS.map((questId) => {
    const definition = getQuestDefinition(questId);
    const status = getCompletionQuestStatus(questId, state, completedQuestIds, activeQuestById);

    return {
      questId,
      name: definition?.name ?? questId,
      icon: definition?.icon ?? '📜',
      description: definition?.description ?? 'Complete this final contract.',
      completed: completedQuestIds.has(questId),
      status,
    };
  });

  const finalHunts = COMPLETION_FINAL_HUNTS.map((hunt) => {
    const enemy = ENEMY_DEFINITIONS[hunt.enemyId];
    const zone = ZONE_DEFINITIONS[hunt.zoneId];
    const linkedQuest = getQuestDefinition(hunt.questId);
    const questStatus = getCompletionQuestStatus(
      hunt.questId,
      state,
      completedQuestIds,
      activeQuestById
    );
    const activeQuestState = activeQuestById.get(hunt.questId);
    const killObjective = getKillObjective(linkedQuest?.objectives ?? [], hunt.enemyId);
    const targetKillCount = killObjective?.amount ?? 0;
    const currentKillCount = questStatus === 'completed'
      ? targetKillCount
      : Math.min(activeQuestState?.progress[killObjective?.id ?? ''] ?? 0, targetKillCount);
    const kills = state.combat.enemyKillCounts[hunt.enemyId] ?? 0;
    const unlocked = combatLevel >= Math.max(
      zone?.combatLevelRequired ?? 1,
      enemy?.combatLevelRequired ?? 1
    );

    return {
      enemyId: hunt.enemyId,
      enemyName: enemy?.name ?? hunt.enemyId,
      enemyIcon: enemy?.icon ?? '⚔️',
      zoneId: hunt.zoneId,
      zoneName: zone?.name ?? hunt.zoneId,
      combatLevelRequired: Math.max(
        zone?.combatLevelRequired ?? 1,
        enemy?.combatLevelRequired ?? 1
      ),
      kills,
      unlocked,
      questId: hunt.questId,
      questName: linkedQuest?.name ?? hunt.questId,
      questCompleted: completedQuestIds.has(hunt.questId),
      questStatus,
      questKillProgress: {
        current: currentKillCount,
        target: targetKillCount,
        remaining: Math.max(0, targetKillCount - currentKillCount),
      },
    };
  });

  const progress: CompletionProgress = {
    lore: COMPLETION_LORE,
    ascension: {
      player: buildMetric(state.player.level, COMPLETION_TARGETS.playerLevel),
      combat: buildMetric(combatLevel, COMPLETION_TARGETS.combatLevel),
    },
    realm: {
      quests: buildMetric(state.quests.totalCompleted, COMPLETION_TARGETS.questsCompleted),
      kills: buildMetric(state.combat.totalKills, COMPLETION_TARGETS.totalKills),
      zones: buildMetric(unlockedZones, Object.keys(ZONE_DEFINITIONS).length),
    },
    finalContracts: {
      completedCount: finalContracts.filter((entry) => entry.completed).length,
      total: finalContracts.length,
      entries: finalContracts,
    },
    finalHunts,
    recommendation: {
      kind: 'finish-ascension',
      title: 'Push player level',
      detail: '0/0 recorded toward the final ledger.',
      actionLabel: '0 remaining',
    },
  };

  progress.recommendation = buildCompletionRecommendation(
    state,
    finalContracts,
    finalHunts,
    activeQuestById
  ) ?? getAscensionRecommendation(progress);

  return progress;
}
