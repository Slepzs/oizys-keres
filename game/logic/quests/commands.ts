import type { GameState } from '../../types';
import type {
  QuestsState,
  PlayerQuestState,
  QuestReward,
} from '../../types/quests';
import { getQuestDefinition } from '../../data/quests.data';
import { addSkillXp, addPlayerXp } from '../xp';
import { addResource } from '../resources';
import { addItemToBag } from '../bag';
import { isQuestAvailable } from './queries';

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
  questsState: QuestsState,
  now: number
): StartQuestResult {
  if (!isQuestAvailable(questId, state, questsState, now)) {
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

  const progress: Record<string, number> = {};
  for (const objective of definition.objectives) {
    progress[objective.id] = 0;
  }

  const newQuestState: PlayerQuestState = {
    questId,
    progress,
    completed: false,
    startedAt: now,
  };

  return {
    quests: {
      ...questsState,
      active: [...questsState.active, newQuestState],
    },
    success: true,
  };
}

export function abandonQuest(questId: string, questsState: QuestsState): QuestsState {
  return {
    ...questsState,
    active: questsState.active.filter((q) => q.questId !== questId),
  };
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
  questId: string,
  now: number
): ApplyRewardsResult {
  const definition = getQuestDefinition(questId);
  if (!definition) {
    return { state: gameState, quests: questsState };
  }

  let newState = { ...gameState };

  for (const reward of definition.rewards) {
    newState = applyReward(newState, reward);
  }

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
    [questId]: now,
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

