import type { GameContext, GameState } from '../../types';
import type { AchievementDefinition, AchievementReward } from '../../types/achievements';
import type { GameEvent } from '../../systems/events.types';
import { addMultiplier } from '../multipliers';
import { evaluateAchievementCondition, getAllAchievementDefinitions } from './queries';

/**
 * Check all achievements and unlock any that have met their conditions.
 * Returns updated game state with newly unlocked achievements.
 */
export function checkAchievements(state: GameState, triggerEvent: GameEvent, ctx: GameContext): GameState {
  let newState = state;

  for (const definition of getAllAchievementDefinitions()) {
    if (newState.achievements.unlocked.includes(definition.id)) {
      continue;
    }

    if (evaluateAchievementCondition(definition.condition, newState)) {
      newState = unlockAchievement(newState, definition, ctx);
    }
  }

  return newState;
}

/**
 * Unlock a specific achievement and apply its rewards.
 */
export function unlockAchievement(state: GameState, definition: AchievementDefinition, ctx: GameContext): GameState {
  const now = ctx.now;

  let newState: GameState = {
    ...state,
    achievements: {
      ...state.achievements,
      unlocked: [...state.achievements.unlocked, definition.id],
      unlockedAt: {
        ...state.achievements.unlockedAt,
        [definition.id]: now,
      },
    },
  };

  if (definition.rewards) {
    for (const reward of definition.rewards) {
      newState = applyAchievementReward(newState, definition.id, reward);
    }
  }

  return newState;
}

/**
 * Update cumulative progress for achievements that track totals.
 */
export function updateAchievementProgress(state: GameState, achievementId: string, delta: number): GameState {
  return {
    ...state,
    achievements: {
      ...state.achievements,
      progress: {
        ...state.achievements.progress,
        [achievementId]: (state.achievements.progress[achievementId] ?? 0) + delta,
      },
    },
  };
}

function applyAchievementReward(state: GameState, achievementId: string, reward: AchievementReward): GameState {
  switch (reward.type) {
    case 'multiplier':
      return addMultiplier(state, {
        id: `achievement_${achievementId}`,
        source: 'achievement',
        target: reward.target,
        type: 'additive',
        value: reward.bonus,
      });

    case 'resource': {
      const resource = state.resources[reward.resourceId];
      if (!resource) return state;
      return {
        ...state,
        resources: {
          ...state.resources,
          [reward.resourceId]: {
            ...resource,
            amount: resource.amount + reward.amount,
            totalGained: resource.totalGained + reward.amount,
          },
        },
      };
    }

    case 'item':
      return state;

    case 'unlock':
      return state;

    default:
      return state;
  }
}

