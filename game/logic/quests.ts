import type { GameState, SkillId, ResourceId, ItemId } from '../types';
import type {
  QuestCondition,
  QuestDefinition,
  QuestsState,
  PlayerQuestState,
  QuestReward,
  Objective,
} from '../types/quests';
import type { TickEvent } from './tick';
import { QUEST_DEFINITIONS, getQuestDefinition } from '../data/quests.data';
import { addSkillXp, addPlayerXp } from './xp';
import { addResource } from './resources';
import { addItemToBag } from './bag';

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
  questsState: QuestsState
): boolean {
  const definition = getQuestDefinition(questId);
  if (!definition) return false;

  // Check if already active
  if (questsState.active.some((q) => q.questId === questId)) {
    return false;
  }

  // Check if already completed (non-repeatable)
  if (!definition.repeatable && questsState.completed.includes(questId)) {
    return false;
  }

  // Check cooldown for repeatables
  if (definition.repeatable && definition.cooldownMs) {
    const lastCompleted = questsState.lastCompletedAt[questId];
    if (lastCompleted && Date.now() - lastCompleted < definition.cooldownMs) {
      return false;
    }
  }

  // Check unlock conditions
  if (definition.unlock && definition.unlock.length > 0) {
    return definition.unlock.every((condition) =>
      evaluateCondition(condition, state, questsState.completed)
    );
  }

  return true;
}

export function getAvailableQuests(
  state: GameState,
  questsState: QuestsState
): QuestDefinition[] {
  return Object.values(QUEST_DEFINITIONS).filter((def) =>
    isQuestAvailable(def.id, state, questsState)
  );
}

// ============================================================================
// Quest Management
// ============================================================================

export interface StartQuestResult {
  quests: QuestsState;
  success: boolean;
  error?: string;
}

export function startQuest(
  questId: string,
  state: GameState,
  questsState: QuestsState
): StartQuestResult {
  if (!isQuestAvailable(questId, state, questsState)) {
    return {
      quests: questsState,
      success: false,
      error: 'Quest not available',
    };
  }

  const definition = getQuestDefinition(questId);
  if (!definition) {
    return {
      quests: questsState,
      success: false,
      error: 'Quest not found',
    };
  }

  // Create initial progress
  const progress: Record<string, number> = {};
  for (const objective of definition.objectives) {
    progress[objective.id] = 0;
  }

  const newQuestState: PlayerQuestState = {
    questId,
    progress,
    completed: false,
    startedAt: Date.now(),
  };

  return {
    quests: {
      ...questsState,
      active: [...questsState.active, newQuestState],
    },
    success: true,
  };
}

export function abandonQuest(
  questId: string,
  questsState: QuestsState
): QuestsState {
  return {
    ...questsState,
    active: questsState.active.filter((q) => q.questId !== questId),
  };
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
// Event Processing
// ============================================================================

export interface QuestEventResult {
  quests: QuestsState;
  completedQuests: string[];
}

export function processQuestEvents(
  events: TickEvent[],
  questsState: QuestsState,
  gameState: GameState
): QuestEventResult {
  const completedQuests: string[] = [];
  let newQuestsState = { ...questsState };

  // Process each active quest
  const updatedActive = newQuestsState.active.map((questState) => {
    if (questState.completed) return questState;

    const definition = getQuestDefinition(questState.questId);
    if (!definition) return questState;

    let newProgress = { ...questState.progress };
    let hasChanges = false;

    // Process each event against objectives
    for (const event of events) {
      for (const objective of definition.objectives) {
        const progressDelta = getEventProgressDelta(event, objective, gameState);
        if (progressDelta > 0) {
          newProgress[objective.id] = (newProgress[objective.id] ?? 0) + progressDelta;
          hasChanges = true;
        }
      }
    }

    if (!hasChanges) return questState;

    // Check if quest is now complete
    const updatedQuestState: PlayerQuestState = {
      ...questState,
      progress: newProgress,
    };

    const { allComplete } = getQuestProgress(updatedQuestState);
    if (allComplete) {
      completedQuests.push(questState.questId);
      return {
        ...updatedQuestState,
        completed: true,
        completedAt: Date.now(),
      };
    }

    return updatedQuestState;
  });

  newQuestsState = {
    ...newQuestsState,
    active: updatedActive,
  };

  return { quests: newQuestsState, completedQuests };
}

function getEventProgressDelta(
  event: TickEvent,
  objective: Objective,
  gameState: GameState
): number {
  switch (event.type) {
    case 'SKILL_ACTION':
      if (objective.type === 'gain_xp' && objective.target === event.skillId) {
        return event.xpGained;
      }
      if (objective.type === 'gain_resource') {
        // Check if the skill produces the target resource
        // For now, use the resourceGained from the event if skill matches
        // This works because SKILL_ACTION comes with resourceGained
        if (event.resourceGained > 0) {
          // We need to check what resource this skill produces
          // But since we don't have direct skill->resource mapping in the event,
          // we approximate by checking if gain_resource targets match skill
          return event.resourceGained;
        }
      }
      return 0;

    case 'SKILL_LEVEL_UP':
      if (objective.type === 'reach_level' && objective.target === event.skillId) {
        // Return the new level - quests track current level against target
        return event.newLevel;
      }
      return 0;

    case 'PLAYER_LEVEL_UP':
      // Handle player level objectives (we track this via reach_level on any skill)
      return 0;

    case 'ITEM_DROPPED':
      if (objective.type === 'collect_item' && objective.target === event.itemId) {
        return event.quantity;
      }
      return 0;

    default:
      return 0;
  }
}

// ============================================================================
// Reward Application
// ============================================================================

export interface ApplyRewardsResult {
  state: GameState;
  quests: QuestsState;
}

export function applyQuestRewards(
  gameState: GameState,
  questsState: QuestsState,
  questId: string
): ApplyRewardsResult {
  const definition = getQuestDefinition(questId);
  if (!definition) {
    return { state: gameState, quests: questsState };
  }

  let newState = { ...gameState };

  for (const reward of definition.rewards) {
    newState = applyReward(newState, reward);
  }

  // Move quest from active to completed
  const questState = questsState.active.find((q) => q.questId === questId);
  if (!questState) {
    return { state: newState, quests: questsState };
  }

  const newCompleted = questsState.completed.includes(questId)
    ? questsState.completed
    : [...questsState.completed, questId];

  const newCompletedCount = {
    ...questsState.completedCount,
    [questId]: (questsState.completedCount[questId] ?? 0) + 1,
  };

  const newLastCompletedAt = {
    ...questsState.lastCompletedAt,
    [questId]: Date.now(),
  };

  const newQuestsState: QuestsState = {
    ...questsState,
    active: questsState.active.filter((q) => q.questId !== questId),
    completed: newCompleted,
    completedCount: newCompletedCount,
    lastCompletedAt: newLastCompletedAt,
    totalCompleted: questsState.totalCompleted + 1,
  };

  return { state: newState, quests: newQuestsState };
}

function applyReward(state: GameState, reward: QuestReward): GameState {
  switch (reward.type) {
    case 'xp': {
      const skill = state.skills[reward.skill];
      if (!skill) return state;
      const result = addSkillXp(skill, reward.amount);
      return {
        ...state,
        skills: {
          ...state.skills,
          [reward.skill]: {
            ...skill,
            xp: result.newXp,
            level: result.newLevel,
          },
        },
      };
    }

    case 'player_xp': {
      const result = addPlayerXp(state.player, reward.amount);
      return {
        ...state,
        player: {
          ...state.player,
          xp: result.newXp,
          level: result.newLevel,
        },
      };
    }

    case 'resource': {
      const result = addResource(state.resources, reward.resource, reward.amount);
      return {
        ...state,
        resources: result.resources,
      };
    }

    case 'item': {
      const result = addItemToBag(state.bag, reward.itemId, reward.quantity);
      return {
        ...state,
        bag: result.bag,
      };
    }

    default:
      return state;
  }
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
  questsState: QuestsState
): number {
  const definition = getQuestDefinition(questId);
  if (!definition || !definition.repeatable || !definition.cooldownMs) {
    return 0;
  }

  const lastCompleted = questsState.lastCompletedAt[questId];
  if (!lastCompleted) return 0;

  const elapsed = Date.now() - lastCompleted;
  return Math.max(0, definition.cooldownMs - elapsed);
}
