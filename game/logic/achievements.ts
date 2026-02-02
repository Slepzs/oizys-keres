import type { GameState, SkillId } from '../types';
import type {
  AchievementCondition,
  AchievementDefinition,
  AchievementsState,
  AchievementReward,
} from '../types/achievements';
import type { GameEvent } from '../systems/events.types';
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements.data';
import { addMultiplier } from './multipliers';

/**
 * Evaluate if an achievement condition is met.
 */
export function evaluateAchievementCondition(
  condition: AchievementCondition,
  state: GameState
): boolean {
  switch (condition.type) {
    case 'skill_level': {
      const skill = state.skills[condition.skillId];
      return skill ? skill.level >= condition.level : false;
    }

    case 'player_level':
      return state.player.level >= condition.level;

    case 'total_resources': {
      const resource = state.resources[condition.resourceId];
      return resource ? resource.totalGained >= condition.amount : false;
    }

    case 'items_collected':
    case 'total_items_collected': {
      // Check cumulative item collection progress
      const progressKey = `items_${condition.itemId}`;
      const progress = state.achievements.progress[progressKey] ?? 0;
      return progress >= condition.count;
    }

    case 'quests_completed':
      return state.quests.totalCompleted >= condition.count;

    case 'skills_maxed': {
      const maxedCount = Object.values(state.skills)
        .filter(skill => skill.level >= 99).length;
      return maxedCount >= condition.count;
    }

    case 'any_skill_level': {
      return Object.values(state.skills)
        .some(skill => skill.level >= condition.level);
    }

    default:
      return false;
  }
}

/**
 * Check all achievements and unlock any that have met their conditions.
 * Returns updated game state with newly unlocked achievements.
 */
export function checkAchievements(
  state: GameState,
  triggerEvent: GameEvent
): GameState {
  let newState = state;
  const newlyUnlocked: string[] = [];

  for (const definition of Object.values(ACHIEVEMENT_DEFINITIONS)) {
    // Skip already unlocked (check newState to handle multiple unlocks in one call)
    if (newState.achievements.unlocked.includes(definition.id)) {
      continue;
    }

    // Check condition
    if (evaluateAchievementCondition(definition.condition, newState)) {
      newState = unlockAchievement(newState, definition);
      newlyUnlocked.push(definition.id);
    }
  }

  return newState;
}

/**
 * Unlock a specific achievement and apply its rewards.
 */
export function unlockAchievement(
  state: GameState,
  definition: AchievementDefinition
): GameState {
  const now = Date.now();

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

  // Apply rewards
  if (definition.rewards) {
    for (const reward of definition.rewards) {
      newState = applyAchievementReward(newState, definition.id, reward);
    }
  }

  return newState;
}

/**
 * Apply a single achievement reward.
 */
function applyAchievementReward(
  state: GameState,
  achievementId: string,
  reward: AchievementReward
): GameState {
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
      // Items are added to bag - handled separately
      return state;

    case 'unlock':
      // Feature unlocks are checked elsewhere
      return state;

    default:
      return state;
  }
}

/**
 * Update cumulative progress for achievements that track totals.
 */
export function updateAchievementProgress(
  state: GameState,
  achievementId: string,
  delta: number
): GameState {
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

/**
 * Get all unlocked achievements.
 */
export function getUnlockedAchievements(state: GameState): AchievementDefinition[] {
  return state.achievements.unlocked
    .map(id => ACHIEVEMENT_DEFINITIONS[id])
    .filter((def): def is AchievementDefinition => def !== undefined);
}

/**
 * Get all locked but visible achievements.
 */
export function getLockedAchievements(state: GameState): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS)
    .filter(def => !state.achievements.unlocked.includes(def.id))
    .filter(def => !def.hidden);
}
