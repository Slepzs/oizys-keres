import type { GameState } from '../../types';
import type { AchievementCondition, AchievementDefinition } from '../../types/achievements';
import { ACHIEVEMENT_DEFINITIONS } from '../../data/achievements.data';

/**
 * Evaluate if an achievement condition is met.
 */
export function evaluateAchievementCondition(condition: AchievementCondition, state: GameState): boolean {
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
      const progressKey = `items_${condition.itemId}`;
      const progress = state.achievements.progress[progressKey] ?? 0;
      return progress >= condition.count;
    }

    case 'quests_completed':
      return state.quests.totalCompleted >= condition.count;

    case 'skills_maxed': {
      const maxedCount = Object.values(state.skills).filter((skill) => skill.level >= 99).length;
      return maxedCount >= condition.count;
    }

    case 'any_skill_level': {
      return Object.values(state.skills).some((skill) => skill.level >= condition.level);
    }

    default:
      return false;
  }
}

export function getAllAchievementDefinitions(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS);
}

/**
 * Get all unlocked achievements.
 */
export function getUnlockedAchievements(state: GameState): AchievementDefinition[] {
  return state.achievements.unlocked
    .map((id) => ACHIEVEMENT_DEFINITIONS[id])
    .filter((def): def is AchievementDefinition => def !== undefined);
}

/**
 * Get all locked but visible achievements.
 */
export function getLockedAchievements(state: GameState): AchievementDefinition[] {
  return Object.values(ACHIEVEMENT_DEFINITIONS)
    .filter((def) => !state.achievements.unlocked.includes(def.id))
    .filter((def) => !def.hidden);
}
