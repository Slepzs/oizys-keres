import { eventBus, registerOnce } from './events';
import { checkAchievements, updateAchievementProgress } from '../logic/achievements';

/**
 * Register achievement handlers with the event bus.
 * Should be called once during app initialization.
 *
 * Achievements are checked after quests (priority 100 vs quest priority 50)
 * to ensure quest completion counts are updated before achievement checks.
 */
export function registerAchievementHandlers(): void {
  registerOnce('achievement-handlers', () => {
    // Check achievements on skill level up
    eventBus.on('SKILL_LEVEL_UP', (event, state) => {
      return checkAchievements(state, event);
    }, 100);

    // Check achievements on player level up
    eventBus.on('PLAYER_LEVEL_UP', (event, state) => {
      return checkAchievements(state, event);
    }, 100);

    // Track item collection and check achievements on item drops
    eventBus.on('ITEM_DROPPED', (event, state) => {
      // Update cumulative progress for item collection achievements
      const progressKey = `items_${event.itemId}`;
      const newState = updateAchievementProgress(state, progressKey, event.quantity);
      return checkAchievements(newState, event);
    }, 100);

    // Note: QUEST_COMPLETED achievements are handled directly in quest-handler.ts
    // to avoid timing issues with the event bus. This ensures quest completion
    // counts are updated before achievement checks run.
  });
}
