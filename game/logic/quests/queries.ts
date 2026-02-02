import type { GameState } from '../../types';
import type {
  QuestCondition,
  QuestDefinition,
  QuestsState,
  PlayerQuestState,
  Objective,
} from '../../types/quests';
import { QUEST_DEFINITIONS, getQuestDefinition } from '../../data/quests.data';

// ============================================================================
// Condition Evaluation
// ============================================================================

export function evaluateCondition(
  condition: QuestCondition,
  state: GameState,
  completedQuests: string[]
): boolean {
  switch (condition.type) {
    case 'level_at_least': {
      const skill = state.skills[condition.skill];
      return skill ? skill.level >= condition.value : false;
    }
    case 'quest_completed':
      return completedQuests.includes(condition.questId);
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

// ============================================================================
// Quest Availability
// ============================================================================

export function isQuestAvailable(
  questId: string,
  state: GameState,
  questsState: QuestsState,
  now: number
): boolean {
  const definition = getQuestDefinition(questId);
  if (!definition) return false;

  if (questsState.active.some((q) => q.questId === questId)) {
    return false;
  }

  if (!definition.repeatable && questsState.completed.includes(questId)) {
    return false;
  }

  if (definition.repeatable && definition.cooldownMs) {
    const lastCompleted = questsState.lastCompletedAt[questId];
    if (lastCompleted && now - lastCompleted < definition.cooldownMs) {
      return false;
    }
  }

  if (definition.unlock && definition.unlock.length > 0) {
    return definition.unlock.every((condition) =>
      evaluateCondition(condition, state, questsState.completed)
    );
  }

  return true;
}

export function getAvailableQuests(
  state: GameState,
  questsState: QuestsState,
  now: number
): QuestDefinition[] {
  return Object.values(QUEST_DEFINITIONS).filter((def) =>
    isQuestAvailable(def.id, state, questsState, now)
  );
}

// ============================================================================
// Progress Calculation
// ============================================================================

export function getObjectiveProgress(
  objective: Objective,
  progress: number
): { current: number; target: number; complete: boolean } {
  let target: number;

  switch (objective.type) {
    case 'gain_xp':
    case 'gain_resource':
    case 'collect_item':
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

  return {
    current: Math.min(progress, target),
    target,
    complete: progress >= target,
  };
}

export function getQuestProgress(
  questState: PlayerQuestState
): { percentage: number; allComplete: boolean } {
  const definition = getQuestDefinition(questState.questId);
  if (!definition) {
    return { percentage: 0, allComplete: false };
  }

  let totalProgress = 0;
  let completedObjectives = 0;

  for (const objective of definition.objectives) {
    const progress = questState.progress[objective.id] ?? 0;
    const { current, target, complete } = getObjectiveProgress(objective, progress);

    totalProgress += target > 0 ? current / target : 0;
    if (complete) completedObjectives++;
  }

  const objectiveCount = definition.objectives.length;
  const percentage = objectiveCount > 0 ? totalProgress / objectiveCount : 0;
  const allComplete = completedObjectives === objectiveCount;

  return { percentage, allComplete };
}

// ============================================================================
// Quest Readiness Helpers
// ============================================================================

export function getReadyToClaimQuests(questsState: QuestsState): PlayerQuestState[] {
  return questsState.active.filter((q) => q.completed);
}

export function getActiveIncompleteQuests(questsState: QuestsState): PlayerQuestState[] {
  return questsState.active.filter((q) => !q.completed);
}

export function getCooldownRemaining(
  questId: string,
  questsState: QuestsState,
  now: number
): number {
  const definition = getQuestDefinition(questId);
  if (!definition || !definition.repeatable || !definition.cooldownMs) {
    return 0;
  }

  const lastCompleted = questsState.lastCompletedAt[questId];
  if (!lastCompleted) return 0;

  const elapsed = now - lastCompleted;
  return Math.max(0, definition.cooldownMs - elapsed);
}

// ============================================================================
// Completed Quests
// ============================================================================

export interface CompletedQuestInfo {
  definition: QuestDefinition;
  completedAt: number;
  completedCount: number;
}

export function getCompletedQuests(questsState: QuestsState): CompletedQuestInfo[] {
  return questsState.completed
    .map((questId) => {
      const definition = getQuestDefinition(questId);
      if (!definition) return null;
      return {
        definition,
        completedAt: questsState.lastCompletedAt[questId] ?? 0,
        completedCount: questsState.completedCount[questId] ?? 1,
      };
    })
    .filter((q): q is CompletedQuestInfo => q !== null)
    .sort((a, b) => b.completedAt - a.completedAt);
}

