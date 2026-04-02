import {
  COMPLETION_FINAL_CONTRACT_IDS,
  COMPLETION_FINAL_HUNTS,
  COMPLETION_LORE,
  COMPLETION_TARGETS,
  ENEMY_DEFINITIONS,
  ITEM_DEFINITIONS,
  QUEST_IDS,
  SKILL_DEFINITIONS,
  getQuestDefinition,
  ZONE_DEFINITIONS,
} from '@/game/data';
import type { GameState } from '@/game/types';
import type { Objective, PlayerQuestState, QuestCondition } from '@/game/types/quests';

import { countItemInBag } from './bag';
import { calculateCombatLevel } from './combat';

type CompletionState = Pick<
  GameState,
  'player' | 'combat' | 'quests' | 'bag' | 'skills' | 'resources'
>;
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

export type CompletionRecommendationFocusArea =
  | 'player'
  | 'skills'
  | 'combat'
  | 'quests'
  | 'kills'
  | 'zones'
  | 'completion';

export interface CompletionRecommendation {
  kind:
    | 'start-contract'
    | 'start-quest'
    | 'advance-quest'
    | 'hunt-contract'
    | 'train-combat'
    | 'train-skill'
    | 'finish-ascension'
    | 'complete-ledger';
  focusArea: CompletionRecommendationFocusArea;
  title: string;
  detail: string;
  actionLabel: string;
  questId?: string;
  enemyId?: string;
  zoneId?: string;
  skillId?: keyof typeof SKILL_DEFINITIONS;
}

interface QuestHuntRoute {
  enemyId: string;
  enemyName: string;
  zoneId: string;
  zoneName: string;
  combatLevelRequired: number;
}

type NonCombatCategory = 'skill' | 'exploration';
type NonCombatBlockerKind =
  | 'ready'
  | 'active'
  | 'skill'
  | 'player'
  | 'prerequisite'
  | 'resource'
  | 'complete';

interface NonCombatBlockerSummary {
  kind: NonCombatBlockerKind;
  label: string;
  detail: string;
  progress?: {
    current: number;
    target: number;
    progress: number;
    label: string;
  };
}

interface NonCombatProgressSummary {
  completedCount: number;
  total: number;
  progress: number;
  nextCategory: NonCombatCategory | null;
  blocker: NonCombatBlockerSummary;
}

interface NextNonCombatQuest {
  questId: string;
  status: CompletionQuestStatus;
  definition: ReturnType<typeof getQuestDefinition>;
  category: NonCombatCategory | null;
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
  nonCombat: NonCombatProgressSummary;
  recommendation: CompletionRecommendation;
  nonCombatRecommendation: CompletionRecommendation;
}

const NON_COMBAT_QUEST_CATEGORIES = new Set(['skill', 'exploration']);

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
    case 'level_at_least': {
      const skill = state.skills[condition.skill];
      return skill ? skill.level >= condition.value : false;
    }
    case 'quest_completed':
      return completedQuestIds.has(condition.questId);
    case 'resource_at_least': {
      const resource = state.resources[condition.resource];
      return resource ? resource.amount >= condition.value : false;
    }
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

function getObjectiveTarget(objective: Objective) {
  switch (objective.type) {
    case 'gain_xp':
    case 'gain_resource':
    case 'collect_item':
    case 'have_item':
    case 'kill':
    case 'craft':
      return objective.amount;
    case 'reach_level':
      return objective.level;
    case 'timer':
      return objective.durationMs;
    default:
      return 0;
  }
}

function getInitialObjectiveCurrent(objective: Objective, state: CompletionState) {
  switch (objective.type) {
    case 'reach_level': {
      const skill = state.skills[objective.target];
      return skill?.level ?? 0;
    }
    case 'have_item':
      return countItemInBag(state.bag, objective.target);
    default:
      return 0;
  }
}

function getObjectiveCurrent(
  objective: Objective,
  activeQuestState: PlayerQuestState | undefined,
  state: CompletionState,
  includeInitialProgress = false
) {
  if (objective.type === 'have_item') {
    return countItemInBag(state.bag, objective.target);
  }

  if (objective.type === 'reach_level') {
    const currentLevel = state.skills[objective.target]?.level ?? 0;
    return Math.max(activeQuestState?.progress[objective.id] ?? 0, currentLevel);
  }

  if (activeQuestState) {
    return activeQuestState.progress[objective.id] ?? 0;
  }

  return includeInitialProgress ? getInitialObjectiveCurrent(objective, state) : 0;
}

function getQuestCompletionPercentage(
  questId: string,
  activeQuestState: PlayerQuestState | undefined,
  state: CompletionState
) {
  const definition = getQuestDefinition(questId);

  if (!definition || definition.objectives.length === 0) {
    return 0;
  }

  const totalProgress = definition.objectives.reduce((sum, objective) => {
    const target = getObjectiveTarget(objective);
    const current = Math.min(
      getObjectiveCurrent(objective, activeQuestState, state, true),
      target
    );

    return sum + (target > 0 ? current / target : 0);
  }, 0);

  return Math.max(0, Math.min(1, totalProgress / definition.objectives.length));
}

function buildPercentBlockerProgress(progressValue: number) {
  const clampedProgress = Math.max(0, Math.min(1, progressValue));
  const current = Math.round(clampedProgress * 100);

  return {
    current,
    target: 100,
    progress: clampedProgress,
    label: `${current}% complete`,
  };
}

function buildThresholdBlockerProgress(current: number, target: number, label: string) {
  const safeTarget = Math.max(1, target);
  const safeCurrent = Math.max(0, Math.min(current, safeTarget));

  return {
    current: safeCurrent,
    target: safeTarget,
    progress: safeCurrent / safeTarget,
    label,
  };
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
    const target = getObjectiveTarget(objective);

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

function formatSkillName(skillId: keyof typeof SKILL_DEFINITIONS) {
  return SKILL_DEFINITIONS[skillId]?.name.toLowerCase() ?? skillId;
}

function isNonCombatQuest(questId: string) {
  const definition = getQuestDefinition(questId);

  if (!definition || definition.repeatable) {
    return false;
  }

  if (!definition.category || !NON_COMBAT_QUEST_CATEGORIES.has(definition.category)) {
    return false;
  }

  return !definition.objectives.some((objective) => objective.type === 'kill');
}

function getNonCombatQuestIds() {
  return QUEST_IDS.filter((questId) => isNonCombatQuest(questId));
}

function getNonCombatQuestCategory(questId: string): NonCombatCategory | null {
  const definition = getQuestDefinition(questId);

  return definition?.category === 'skill' || definition?.category === 'exploration'
    ? definition.category
    : null;
}

function getNextNonCombatQuest(
  state: CompletionState,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): NextNonCombatQuest | null {
  const nextQuestId = getNonCombatQuestIds().find((questId) => !completedQuestIds.has(questId));

  if (!nextQuestId) {
    return null;
  }

  return {
    questId: nextQuestId,
    status: getCompletionQuestStatus(nextQuestId, state, completedQuestIds, activeQuestById),
    definition: getQuestDefinition(nextQuestId),
    category: getNonCombatQuestCategory(nextQuestId),
  };
}

function buildNonCombatBlockerSummary(
  state: CompletionState,
  nextQuest: NextNonCombatQuest | null,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): NonCombatBlockerSummary {
  if (!nextQuest || !nextQuest.definition) {
    return {
      kind: 'complete',
      label: 'Support systems complete',
      detail: 'Every tracked non-combat quest chain is complete.',
    };
  }

  if (nextQuest.status === 'available') {
    return {
      kind: 'ready',
      label: 'Ready now',
      detail: `${nextQuest.definition.name} can be started immediately.`,
    };
  }

  if (nextQuest.status === 'active') {
    const remainingObjectives = getRemainingObjectiveLabels(
      nextQuest.questId,
      activeQuestById.get(nextQuest.questId),
      state
    );

    return {
      kind: 'active',
      label: 'Active quest',
      detail: formatRemainingObjectives(remainingObjectives),
      progress: buildPercentBlockerProgress(
        getQuestCompletionPercentage(nextQuest.questId, activeQuestById.get(nextQuest.questId), state)
      ),
    };
  }

  const unmetCondition = nextQuest.definition.unlock?.find(
    (condition) => !evaluateQuestUnlockCondition(condition, state, completedQuestIds)
  );

  if (!unmetCondition) {
    return {
      kind: 'ready',
      label: 'Ready now',
      detail: `${nextQuest.definition.name} can be started immediately.`,
    };
  }

  switch (unmetCondition.type) {
    case 'level_at_least':
      return {
        kind: 'skill',
        label: `${formatSkillName(unmetCondition.skill)} level ${unmetCondition.value}`,
        detail: `${nextQuest.definition.name} is gated by a ${formatSkillName(unmetCondition.skill)} requirement.`,
        progress: buildThresholdBlockerProgress(
          state.skills[unmetCondition.skill]?.level ?? 0,
          unmetCondition.value,
          `Level ${Math.min(state.skills[unmetCondition.skill]?.level ?? 0, unmetCondition.value)} / ${unmetCondition.value}`
        ),
      };
    case 'player_level_at_least':
      return {
        kind: 'player',
        label: `player level ${unmetCondition.value}`,
        detail: `${nextQuest.definition.name} is gated by player ascension.`,
        progress: buildThresholdBlockerProgress(
          state.player.level,
          unmetCondition.value,
          `Level ${Math.min(state.player.level, unmetCondition.value)} / ${unmetCondition.value}`
        ),
      };
    case 'quest_completed': {
      const prerequisite = getQuestDefinition(unmetCondition.questId);
      return {
        kind: 'prerequisite',
        label: prerequisite?.name ?? unmetCondition.questId,
        detail: `${nextQuest.definition.name} is blocked by a prerequisite quest.`,
        progress: buildPercentBlockerProgress(
          getQuestCompletionPercentage(
            unmetCondition.questId,
            activeQuestById.get(unmetCondition.questId),
            state
          )
        ),
      };
    }
    case 'resource_at_least':
      return {
        kind: 'resource',
        label: `${unmetCondition.value} ${unmetCondition.resource.replaceAll('_', ' ')}`,
        detail: `${nextQuest.definition.name} needs more stored resources.`,
        progress: buildThresholdBlockerProgress(
          state.resources[unmetCondition.resource]?.amount ?? 0,
          unmetCondition.value,
          `${Math.min(
            state.resources[unmetCondition.resource]?.amount ?? 0,
            unmetCondition.value
          ).toLocaleString()} / ${unmetCondition.value.toLocaleString()}`
        ),
      };
    default:
      return {
        kind: 'prerequisite',
        label: nextQuest.definition.name,
        detail: `${nextQuest.definition.name} is still blocked.`,
      };
  }
}

function buildNonCombatSummary(
  state: CompletionState,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): NonCombatProgressSummary {
  const nonCombatQuestIds = getNonCombatQuestIds();
  const completedCount = nonCombatQuestIds.filter((questId) => completedQuestIds.has(questId)).length;
  const total = nonCombatQuestIds.length;
  const nextQuest = getNextNonCombatQuest(state, completedQuestIds, activeQuestById);

  return {
    completedCount,
    total,
    progress: total > 0 ? completedCount / total : 1,
    nextCategory: nextQuest?.category ?? null,
    blocker: buildNonCombatBlockerSummary(state, nextQuest, completedQuestIds, activeQuestById),
  };
}

function buildNonCombatLockedRecommendation(
  state: CompletionState,
  questId: string,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): CompletionRecommendation {
  const definition = getQuestDefinition(questId);
  const unmetCondition = definition?.unlock?.find(
    (condition) => !evaluateQuestUnlockCondition(condition, state, completedQuestIds)
  );

  if (!definition || !unmetCondition) {
    return {
      kind: 'start-quest',
      focusArea: 'quests',
      title: `Start ${definition?.name ?? questId}`,
      detail: definition?.description ?? 'Open the quests board and continue your non-combat ledger.',
      actionLabel: 'Next non-combat quest',
      questId,
    };
  }

  switch (unmetCondition.type) {
    case 'level_at_least':
      return {
        kind: 'train-skill',
        focusArea: 'skills',
        title: `Reach ${formatSkillName(unmetCondition.skill)} level ${unmetCondition.value}`,
        detail: `${definition.name} unlocks once ${formatSkillName(unmetCondition.skill)} reaches level ${unmetCondition.value}.`,
        actionLabel: 'Unlock the next non-combat quest',
        questId,
        skillId: unmetCondition.skill,
      };
    case 'player_level_at_least':
      return {
        kind: 'finish-ascension',
        focusArea: 'player',
        title: `Reach player level ${unmetCondition.value}`,
        detail: `${definition.name} unlocks at player level ${unmetCondition.value}.`,
        actionLabel: 'Unlock the next non-combat quest',
        questId,
      };
    case 'quest_completed': {
      const prerequisite = getQuestDefinition(unmetCondition.questId);
      const prerequisiteStatus = getCompletionQuestStatus(
        unmetCondition.questId,
        state,
        completedQuestIds,
        activeQuestById
      );

      if (prerequisiteStatus === 'active') {
        const remainingObjectives = getRemainingObjectiveLabels(
          unmetCondition.questId,
          activeQuestById.get(unmetCondition.questId),
          state
        );

        return {
          kind: 'advance-quest',
          focusArea: 'quests',
          title: `Advance ${prerequisite?.name ?? unmetCondition.questId}`,
          detail: `${prerequisite?.name ?? unmetCondition.questId} gates ${definition.name}.`,
          actionLabel: formatRemainingObjectives(remainingObjectives),
          questId: unmetCondition.questId,
        };
      }

      return {
        kind: 'start-quest',
        focusArea: 'quests',
        title: `Start ${prerequisite?.name ?? unmetCondition.questId}`,
        detail: `${prerequisite?.name ?? unmetCondition.questId} must be completed before ${definition.name}.`,
        actionLabel: 'Prerequisite quest',
        questId: unmetCondition.questId,
      };
    }
    default:
      return {
        kind: 'start-quest',
        focusArea: 'quests',
        title: `Start ${definition.name}`,
        detail: definition.description,
        actionLabel: 'Next non-combat quest',
        questId,
      };
  }
}

function buildNonCombatRecommendation(
  state: CompletionState,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): CompletionRecommendation {
  const nextQuest = getNextNonCombatQuest(state, completedQuestIds, activeQuestById);

  if (!nextQuest) {
    return {
      kind: 'complete-ledger',
      focusArea: 'completion',
      title: 'Non-Combat Ledger Closed',
      detail: 'Every tracked non-combat quest chain is complete.',
      actionLabel: 'Support systems complete',
    };
  }

  const { questId: nextQuestId, definition, status } = nextQuest;

  if (!definition) {
    return {
      kind: 'start-quest',
      focusArea: 'quests',
      title: `Start ${nextQuestId}`,
      detail: 'Open the quests board and continue your non-combat ledger.',
      actionLabel: 'Next non-combat quest',
      questId: nextQuestId,
    };
  }

  if (status === 'active') {
    const remainingObjectives = getRemainingObjectiveLabels(
      nextQuestId,
      activeQuestById.get(nextQuestId),
      state
    );

    return {
      kind: 'advance-quest',
      focusArea: 'quests',
      title: `Advance ${definition.name}`,
      detail: `${definition.name} is active in your support track.`,
      actionLabel: formatRemainingObjectives(remainingObjectives),
      questId: nextQuestId,
    };
  }

  if (status === 'available') {
    return {
      kind: 'start-quest',
      focusArea: 'quests',
      title: `Start ${definition.name}`,
      detail: definition.description,
      actionLabel: 'Next non-combat quest',
      questId: nextQuestId,
    };
  }

  return buildNonCombatLockedRecommendation(state, nextQuestId, completedQuestIds, activeQuestById);
}

function getAscensionRecommendation(progress: CompletionProgress): CompletionRecommendation {
  const candidates: Array<{
    key: Exclude<CompletionRecommendationFocusArea, 'completion' | 'skills'>;
    label: string;
    metric: ProgressMetric;
  }> = [
    {
      key: 'player' as const,
      label: 'player level',
      metric: progress.ascension.player,
    },
    {
      key: 'combat' as const,
      label: 'combat level',
      metric: progress.ascension.combat,
    },
    {
      key: 'quests' as const,
      label: 'quest completions',
      metric: progress.realm.quests,
    },
    {
      key: 'kills' as const,
      label: 'total kills',
      metric: progress.realm.kills,
    },
    {
      key: 'zones' as const,
      label: 'zones unlocked',
      metric: progress.realm.zones,
    },
  ].filter((candidate) => candidate.metric.progress < 1);

  if (candidates.length === 0) {
    return {
      kind: 'complete-ledger',
      focusArea: 'completion',
      title: 'Last Ledger Closed',
      detail: 'Every tracked completion target is done.',
      actionLabel: 'System complete',
    };
  }

  const nextMetric = candidates.sort((left, right) => left.metric.progress - right.metric.progress)[0];
  const remaining = Math.max(0, nextMetric.metric.target - nextMetric.metric.current);

  return {
    kind: 'finish-ascension',
    focusArea: nextMetric.key,
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
      focusArea: 'quests',
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
        focusArea: 'combat',
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
      focusArea: 'combat',
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
    focusArea: 'quests',
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
    nonCombat: {
      completedCount: 0,
      total: 0,
      progress: 0,
      nextCategory: null,
      blocker: {
        kind: 'complete',
        label: 'Support systems complete',
        detail: 'Every tracked non-combat quest chain is complete.',
      },
    },
    recommendation: {
      kind: 'finish-ascension',
      focusArea: 'player',
      title: 'Push player level',
      detail: '0/0 recorded toward the final ledger.',
      actionLabel: '0 remaining',
    },
    nonCombatRecommendation: {
      kind: 'complete-ledger',
      focusArea: 'completion',
      title: 'Non-Combat Ledger Closed',
      detail: 'Every tracked non-combat quest chain is complete.',
      actionLabel: 'Support systems complete',
    },
  };

  progress.recommendation = buildCompletionRecommendation(
    state,
    finalContracts,
    finalHunts,
    activeQuestById
  ) ?? getAscensionRecommendation(progress);
  progress.nonCombatRecommendation = buildNonCombatRecommendation(
    state,
    completedQuestIds,
    activeQuestById
  );
  progress.nonCombat = buildNonCombatSummary(state, completedQuestIds, activeQuestById);

  return progress;
}
