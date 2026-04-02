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
  gate: CompletionHuntGateSummary;
}

interface CompletionHuntGateSummary {
  kind: 'ready' | 'combat' | 'contract' | 'complete';
  label: string;
  detail: string;
  progress?: {
    current: number;
    target: number;
    progress: number;
    label: string;
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

interface NonCombatAdvisorSummary {
  rationale: {
    label: string;
    detail: string;
  };
  alternative: {
    questId: string;
    title: string;
    label: string;
    detail: string;
    kind: NonCombatBlockerKind;
    category: NonCombatCategory | null;
  } | null;
}

interface CompletionAdvisorSummary {
  rationale: {
    label: string;
    detail: string;
  };
  alternative: CompletionRecommendation | null;
}

interface NextNonCombatQuest {
  questId: string;
  status: CompletionQuestStatus;
  definition: ReturnType<typeof getQuestDefinition>;
  category: NonCombatCategory | null;
}

interface RankedNonCombatQuest extends NextNonCombatQuest {
  blocker: NonCombatBlockerSummary;
  leverage: number;
  progressScore: number;
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
  completionAdvisor: CompletionAdvisorSummary;
  nonCombat: NonCombatProgressSummary;
  nonCombatAdvisor: NonCombatAdvisorSummary;
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

function buildCombatLevelProgress(currentCombatLevel: number, targetCombatLevel: number) {
  const clampedCurrent = Math.min(currentCombatLevel, targetCombatLevel);

  return buildThresholdBlockerProgress(
    currentCombatLevel,
    targetCombatLevel,
    `Combat ${clampedCurrent} / ${targetCombatLevel}`
  );
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

const NON_COMBAT_QUEST_IDS = QUEST_IDS.filter((questId) => isNonCombatQuest(questId));

function buildNonCombatQuestLeverageMap() {
  const childrenByQuest = new Map<string, string[]>();

  NON_COMBAT_QUEST_IDS.forEach((questId) => {
    childrenByQuest.set(questId, []);
  });

  NON_COMBAT_QUEST_IDS.forEach((questId) => {
    const definition = getQuestDefinition(questId);

    definition?.unlock?.forEach((condition) => {
      if (condition.type !== 'quest_completed') {
        return;
      }

      const children = childrenByQuest.get(condition.questId);
      if (children) {
        children.push(questId);
      }
    });
  });

  const leverageByQuest = new Map<string, number>();

  function countDescendants(questId: string): number {
    const cached = leverageByQuest.get(questId);
    if (cached !== undefined) {
      return cached;
    }

    const descendants = childrenByQuest.get(questId) ?? [];
    const total = descendants.reduce((sum, childQuestId) => {
      return sum + 1 + countDescendants(childQuestId);
    }, 0);

    leverageByQuest.set(questId, total);
    return total;
  }

  NON_COMBAT_QUEST_IDS.forEach((questId) => {
    countDescendants(questId);
  });

  return leverageByQuest;
}

const NON_COMBAT_QUEST_LEVERAGE = buildNonCombatQuestLeverageMap();

function getNonCombatQuestIds() {
  return NON_COMBAT_QUEST_IDS;
}

function getNonCombatQuestCategory(questId: string): NonCombatCategory | null {
  const definition = getQuestDefinition(questId);

  return definition?.category === 'skill' || definition?.category === 'exploration'
    ? definition.category
    : null;
}

function getNonCombatQuestLeverage(questId: string) {
  return (NON_COMBAT_QUEST_LEVERAGE.get(questId) ?? 0) + 1;
}

function getStatusPriority(status: CompletionQuestStatus) {
  switch (status) {
    case 'active':
      return 0;
    case 'available':
      return 1;
    case 'locked':
      return 2;
    case 'completed':
    default:
      return 3;
  }
}

function getCandidateProgressScore(status: CompletionQuestStatus, blocker: NonCombatBlockerSummary) {
  if (status === 'available' || blocker.kind === 'ready' || blocker.kind === 'complete') {
    return 1;
  }

  return blocker.progress?.progress ?? 0;
}

function formatCandidatePercent(progressValue: number) {
  return `${Math.round(Math.max(0, Math.min(1, progressValue)) * 100)}%`;
}

function capitalizeLabel(value: string) {
  return value.length > 0 ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function compareRankedNonCombatQuest(left: RankedNonCombatQuest, right: RankedNonCombatQuest) {
  const statusDelta = getStatusPriority(left.status) - getStatusPriority(right.status);
  if (statusDelta !== 0) {
    return statusDelta;
  }

  if (left.status === 'active' || left.status === 'locked') {
    const progressDelta = right.progressScore - left.progressScore;
    if (Math.abs(progressDelta) > Number.EPSILON) {
      return progressDelta;
    }
  }

  const leverageDelta = right.leverage - left.leverage;
  if (leverageDelta !== 0) {
    return leverageDelta;
  }

  const categoryDelta = (left.category ?? '').localeCompare(right.category ?? '');
  if (categoryDelta !== 0) {
    return categoryDelta;
  }

  return left.questId.localeCompare(right.questId);
}

function buildNonCombatBlockerSummaryForQuest(
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

function getRankedNonCombatQuests(
  state: CompletionState,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): RankedNonCombatQuest[] {
  return getNonCombatQuestIds()
    .filter((questId) => !completedQuestIds.has(questId))
    .map((questId) => {
      const candidate: NextNonCombatQuest = {
        questId,
        status: getCompletionQuestStatus(questId, state, completedQuestIds, activeQuestById),
        definition: getQuestDefinition(questId),
        category: getNonCombatQuestCategory(questId),
      };
      const blocker = buildNonCombatBlockerSummaryForQuest(
        state,
        candidate,
        completedQuestIds,
        activeQuestById
      );

      return {
        ...candidate,
        blocker,
        leverage: getNonCombatQuestLeverage(questId),
        progressScore: getCandidateProgressScore(candidate.status, blocker),
      };
    })
    .sort(compareRankedNonCombatQuest);
}

function buildNonCombatSummary(
  completedQuestIds: Set<string>,
  rankedCandidates: RankedNonCombatQuest[]
): NonCombatProgressSummary {
  const nonCombatQuestIds = getNonCombatQuestIds();
  const completedCount = nonCombatQuestIds.filter((questId) => completedQuestIds.has(questId)).length;
  const total = nonCombatQuestIds.length;
  const nextQuest = rankedCandidates[0] ?? null;

  return {
    completedCount,
    total,
    progress: total > 0 ? completedCount / total : 1,
    nextCategory: nextQuest?.category ?? null,
    blocker: nextQuest?.blocker ?? {
      kind: 'complete',
      label: 'Support systems complete',
      detail: 'Every tracked non-combat quest chain is complete.',
    },
  };
}

function buildNonCombatAdvisor(
  rankedCandidates: RankedNonCombatQuest[]
): NonCombatAdvisorSummary {
  const primary = rankedCandidates[0] ?? null;
  const secondary = rankedCandidates[1] ?? null;

  if (!primary) {
    return {
      rationale: {
        label: 'Support systems complete',
        detail: 'Every tracked non-combat quest chain is complete.',
      },
      alternative: null,
    };
  }

  const primaryName = primary.definition?.name ?? primary.questId;
  const secondaryName = secondary?.definition?.name ?? secondary.questId;
  const alternative = secondary
    ? {
        questId: secondary.questId,
        title: secondaryName,
        label: secondary.blocker.label,
        detail: secondary.blocker.detail,
        kind: secondary.blocker.kind,
        category: secondary.category,
      }
    : null;

  if (primary.status === 'active') {
    return {
      rationale: {
        label: 'Active quest first',
        detail: secondaryName
          ? `${primaryName} is already underway, so it stays ahead of ${secondaryName}.`
          : `${primaryName} is already underway, so it keeps the support planner focused.`,
      },
      alternative,
    };
  }

  if (primary.status === 'available') {
    if (secondary && secondary.status === 'available' && primary.leverage !== secondary.leverage) {
      return {
        rationale: {
          label: 'Highest leverage ready branch',
          detail: `${primaryName} opens ${Math.max(0, primary.leverage - 1)} downstream support quests, ahead of ${secondaryName} with ${Math.max(0, secondary.leverage - 1)}.`,
        },
        alternative,
      };
    }

    return {
      rationale: {
        label: 'Ready branch',
        detail: secondaryName
          ? `${primaryName} can start immediately and outranks ${secondaryName}.`
          : `${primaryName} can be started immediately.`,
      },
      alternative,
    };
  }

  if (
    secondary &&
    Math.abs(primary.progressScore - secondary.progressScore) > Number.EPSILON
  ) {
    return {
      rationale: {
        label: 'Closest unlock',
        detail: `${primaryName} is ${formatCandidatePercent(primary.progressScore)} unlocked, ahead of ${secondaryName} at ${formatCandidatePercent(secondary.progressScore)}.`,
      },
      alternative,
    };
  }

  if (secondary && primary.leverage !== secondary.leverage) {
    return {
      rationale: {
        label: 'Highest leverage lock',
        detail: `${primaryName} opens ${Math.max(0, primary.leverage - 1)} downstream support quests, ahead of ${secondaryName} with ${Math.max(0, secondary.leverage - 1)}.`,
      },
      alternative,
    };
  }

  return {
    rationale: {
      label: 'Best blocked branch',
      detail: `${primaryName} is the strongest remaining support unlock.`,
    },
    alternative,
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
  activeQuestById: Map<string, PlayerQuestState>,
  rankedCandidates: RankedNonCombatQuest[]
): CompletionRecommendation {
  const nextQuest = rankedCandidates[0] ?? null;

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
  const candidates = getAscensionCandidates(progress);

  if (candidates.length === 0) {
    return {
      kind: 'complete-ledger',
      focusArea: 'completion',
      title: 'Last Ledger Closed',
      detail: 'Every tracked completion target is done.',
      actionLabel: 'System complete',
    };
  }

  const nextMetric = candidates[0];
  const remaining = Math.max(0, nextMetric.metric.target - nextMetric.metric.current);

  return {
    kind: 'finish-ascension',
    focusArea: nextMetric.key,
    title: `Push ${nextMetric.label}`,
    detail: `${nextMetric.metric.current.toLocaleString()}/${nextMetric.metric.target.toLocaleString()} recorded toward the final ledger.`,
    actionLabel: `${remaining.toLocaleString()} remaining`,
  };
}

function getAscensionCandidates(progress: CompletionProgress): Array<{
  key: Exclude<CompletionRecommendationFocusArea, 'completion' | 'skills'>;
  label: string;
  metric: ProgressMetric;
}> {
  return [
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
  ]
    .filter((candidate) => candidate.metric.progress < 1)
    .sort((left, right) => left.metric.progress - right.metric.progress);
}

function buildFinalContractRecommendation(
  state: CompletionState,
  contract: CompletionContractEntry,
  finalHunts: CompletionHuntEntry[],
  activeQuestById: Map<string, PlayerQuestState>
): CompletionRecommendation {
  const linkedHunt = finalHunts.find((hunt) => hunt.questId === contract.questId);
  const questHuntRoute = linkedHunt
    ? {
        enemyId: linkedHunt.enemyId,
        enemyName: linkedHunt.enemyName,
        zoneId: linkedHunt.zoneId,
        zoneName: linkedHunt.zoneName,
        combatLevelRequired: linkedHunt.combatLevelRequired,
      }
    : getQuestHuntRoute(contract.questId);

  if (contract.status === 'available') {
    return {
      kind: 'start-contract',
      focusArea: 'quests',
      title: `Start ${contract.name}`,
      detail: questHuntRoute
        ? `Return to the ${questHuntRoute.zoneName} and reopen the ${questHuntRoute.enemyName.toLowerCase()} hunt.`
        : contract.description,
      actionLabel: 'Next final contract',
      questId: contract.questId,
      enemyId: questHuntRoute?.enemyId,
      zoneId: questHuntRoute?.zoneId,
    };
  }

  if (contract.status === 'active' && questHuntRoute) {
    if (calculateCombatLevel(state.combat.combatSkills) < questHuntRoute.combatLevelRequired) {
      return {
        kind: 'train-combat',
        focusArea: 'combat',
        title: `Reach combat level ${questHuntRoute.combatLevelRequired}`,
        detail: `${contract.name} is active, but ${questHuntRoute.enemyName} in ${questHuntRoute.zoneName} is still locked.`,
        actionLabel: 'Unlock the next final hunt',
        questId: contract.questId,
        enemyId: questHuntRoute.enemyId,
        zoneId: questHuntRoute.zoneId,
      };
    }

    const remainingObjectives = getRemainingObjectiveLabels(
      contract.questId,
      activeQuestById.get(contract.questId),
      state
    );

    return {
      kind: 'hunt-contract',
      focusArea: 'combat',
      title: `Hunt ${questHuntRoute.enemyName}`,
      detail: `${contract.name} is active in ${questHuntRoute.zoneName}.`,
      actionLabel: formatRemainingObjectives(remainingObjectives),
      questId: contract.questId,
      enemyId: questHuntRoute.enemyId,
      zoneId: questHuntRoute.zoneId,
    };
  }

  return {
    kind: 'start-contract',
    focusArea: 'quests',
    title: `Start ${contract.name}`,
    detail: contract.description,
    actionLabel: 'Next final contract',
    questId: contract.questId,
  };
}

function buildFinalContractPreview(
  contract: CompletionContractEntry,
  finalHunts: CompletionHuntEntry[]
): CompletionRecommendation {
  const linkedHunt = finalHunts.find((hunt) => hunt.questId === contract.questId);
  const questHuntRoute = linkedHunt
    ? {
        enemyId: linkedHunt.enemyId,
        enemyName: linkedHunt.enemyName,
        zoneId: linkedHunt.zoneId,
        zoneName: linkedHunt.zoneName,
      }
    : getQuestHuntRoute(contract.questId);

  return {
    kind: 'start-contract',
    focusArea: 'quests',
    title: `Start ${contract.name}`,
    detail: questHuntRoute
      ? `Return to the ${questHuntRoute.zoneName} and reopen the ${questHuntRoute.enemyName.toLowerCase()} hunt.`
      : contract.description,
    actionLabel: 'Next final contract',
    questId: contract.questId,
    enemyId: questHuntRoute?.enemyId,
    zoneId: questHuntRoute?.zoneId,
  };
}

function buildCompletionAdvisor(
  state: CompletionState,
  progress: CompletionProgress,
  finalContracts: CompletionContractEntry[],
  finalHunts: CompletionHuntEntry[],
  activeQuestById: Map<string, PlayerQuestState>
): CompletionAdvisorSummary {
  const nextContractIndex = finalContracts.findIndex((entry) => entry.status !== 'completed');

  if (nextContractIndex >= 0) {
    const nextContract = finalContracts[nextContractIndex];
    const followUpContract = finalContracts.slice(nextContractIndex + 1).find(
      (entry) => entry.status !== 'completed'
    );
    const linkedHunt = finalHunts.find((hunt) => hunt.questId === nextContract.questId);
    const combatLevel = calculateCombatLevel(state.combat.combatSkills);

    if (
      nextContract.status === 'active' &&
      linkedHunt &&
      combatLevel < linkedHunt.combatLevelRequired
    ) {
      return {
        rationale: {
          label: 'Combat gate first',
          detail: followUpContract
            ? `${nextContract.name} is active, but ${linkedHunt.enemyName} stays locked until combat level ${linkedHunt.combatLevelRequired} before ${followUpContract.name}.`
            : `${nextContract.name} is active, but ${linkedHunt.enemyName} stays locked until combat level ${linkedHunt.combatLevelRequired}.`,
        },
        alternative: followUpContract
          ? buildFinalContractPreview(followUpContract, finalHunts)
          : null,
      };
    }

    if (nextContract.status === 'active') {
      return {
        rationale: {
          label: 'Active contract first',
          detail: followUpContract
            ? `${nextContract.name} is already underway, so it stays ahead of ${followUpContract.name}.`
            : `${nextContract.name} is already underway, so it keeps the ledger focused.`,
        },
        alternative: followUpContract
          ? buildFinalContractPreview(followUpContract, finalHunts)
          : null,
      };
    }

    return {
      rationale: {
        label: 'Final contract sequence',
        detail: followUpContract
          ? `${nextContract.name} is the next unfinished final contract before ${followUpContract.name}.`
          : `${nextContract.name} is the last unfinished final contract.`,
      },
      alternative: followUpContract
        ? buildFinalContractPreview(followUpContract, finalHunts)
        : null,
    };
  }

  const ascensionCandidates = getAscensionCandidates(progress);
  const primary = ascensionCandidates[0] ?? null;
  const secondary = ascensionCandidates[1] ?? null;

  if (!primary) {
    return {
      rationale: {
        label: 'Final ledger closed',
        detail: 'Every tracked completion target is done.',
      },
      alternative: null,
    };
  }

  const alternative = secondary
    ? {
        kind: 'finish-ascension' as const,
        focusArea: secondary.key,
        title: `Push ${secondary.label}`,
        detail: `${secondary.metric.current.toLocaleString()}/${secondary.metric.target.toLocaleString()} recorded toward the final ledger.`,
        actionLabel: `${Math.max(0, secondary.metric.target - secondary.metric.current).toLocaleString()} remaining`,
      }
    : null;

  return {
    rationale: {
      label: 'Lowest completion metric',
      detail: secondary
        ? `${capitalizeLabel(primary.label)} is ${formatCandidatePercent(primary.metric.progress)} of the final ledger, behind ${secondary.label} at ${formatCandidatePercent(secondary.metric.progress)}.`
        : `${capitalizeLabel(primary.label)} is the last remaining ledger target.`,
    },
    alternative,
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

  return buildFinalContractRecommendation(state, nextContract, finalHunts, activeQuestById);
}

function buildFinalHuntGateSummary(
  state: CompletionState,
  hunt: { enemyId: string; zoneId: string; questId: string },
  combatLevel: number,
  questStatus: CompletionQuestStatus,
  completedQuestIds: Set<string>,
  activeQuestById: Map<string, PlayerQuestState>
): CompletionHuntGateSummary {
  const enemy = ENEMY_DEFINITIONS[hunt.enemyId];
  const zone = ZONE_DEFINITIONS[hunt.zoneId];
  const quest = getQuestDefinition(hunt.questId);
  const enemyName = enemy?.name ?? hunt.enemyId;
  const zoneName = zone?.name ?? hunt.zoneId;
  const combatLevelRequired = Math.max(
    zone?.combatLevelRequired ?? 1,
    enemy?.combatLevelRequired ?? 1
  );
  const activeQuestState = activeQuestById.get(hunt.questId);

  if (questStatus === 'completed') {
    return {
      kind: 'complete',
      label: 'Contract complete',
      detail: `${quest?.name ?? hunt.questId} is already cleared for ${enemyName}.`,
    };
  }

  if (
    (questStatus === 'available' || questStatus === 'active') &&
    combatLevel < combatLevelRequired
  ) {
    return {
      kind: 'combat',
      label: `Combat level ${combatLevelRequired}`,
      detail: `${quest?.name ?? hunt.questId} needs combat level ${combatLevelRequired} before ${enemyName} can be hunted in ${zoneName}.`,
      progress: buildCombatLevelProgress(combatLevel, combatLevelRequired),
    };
  }

  if (questStatus === 'active') {
    const remainingObjectives = getRemainingObjectiveLabels(hunt.questId, activeQuestState, state);

    return {
      kind: 'ready',
      label: 'Active hunt',
      detail: formatRemainingObjectives(remainingObjectives),
      progress: buildPercentBlockerProgress(
        getQuestCompletionPercentage(hunt.questId, activeQuestState, state)
      ),
    };
  }

  if (questStatus === 'available') {
    return {
      kind: 'ready',
      label: 'Contract ready',
      detail: `${quest?.name ?? hunt.questId} can be started now in ${zoneName}.`,
    };
  }

  const unmetCondition = quest?.unlock?.find(
    (condition) => !evaluateQuestUnlockCondition(condition, state, completedQuestIds)
  );

  if (unmetCondition?.type === 'quest_completed') {
    const prerequisite = getQuestDefinition(unmetCondition.questId);

    return {
      kind: 'contract',
      label: prerequisite?.name ?? unmetCondition.questId,
      detail: `${quest?.name ?? hunt.questId} unlocks after ${prerequisite?.name ?? unmetCondition.questId} is finished.`,
      progress: buildPercentBlockerProgress(
        getQuestCompletionPercentage(
          unmetCondition.questId,
          activeQuestById.get(unmetCondition.questId),
          state
        )
      ),
    };
  }

  return {
    kind: 'contract',
    label: 'Contract locked',
    detail: `${quest?.name ?? hunt.questId} is still locked.`,
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
      gate: buildFinalHuntGateSummary(
        state,
        hunt,
        combatLevel,
        questStatus,
        completedQuestIds,
        activeQuestById
      ),
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
    completionAdvisor: {
      rationale: {
        label: 'Final ledger in motion',
        detail: 'The completion planner is deriving the strongest remaining target.',
      },
      alternative: null,
    },
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
    nonCombatAdvisor: {
      rationale: {
        label: 'Support systems complete',
        detail: 'Every tracked non-combat quest chain is complete.',
      },
      alternative: null,
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
  const rankedNonCombatQuests = getRankedNonCombatQuests(
    state,
    completedQuestIds,
    activeQuestById
  );

  progress.recommendation = buildCompletionRecommendation(
    state,
    finalContracts,
    finalHunts,
    activeQuestById
  ) ?? getAscensionRecommendation(progress);
  progress.nonCombatRecommendation = buildNonCombatRecommendation(
    state,
    completedQuestIds,
    activeQuestById,
    rankedNonCombatQuests
  );
  progress.completionAdvisor = buildCompletionAdvisor(
    state,
    progress,
    finalContracts,
    finalHunts,
    activeQuestById
  );
  progress.nonCombat = buildNonCombatSummary(completedQuestIds, rankedNonCombatQuests);
  progress.nonCombatAdvisor = buildNonCombatAdvisor(rankedNonCombatQuests);

  return progress;
}
