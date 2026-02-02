import { eventBus, registerOnce } from './events';
import { getQuestDefinition } from '../data/quests.data';
import { getAchievementDefinition } from '../data/achievements.data';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import type { GameState } from '../types';
import type { NotificationType } from '../types/notifications';

// Global callback set at runtime to avoid circular dependencies
let notificationCallback: ((type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => void) | null = null;

/**
 * Set the notification callback function.
 * This is called once during store initialization to wire up notifications.
 */
export function setNotificationCallback(
  callback: (type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => void
): void {
  notificationCallback = callback;
}

/**
 * Helper to format reward summary for quest completion.
 */
function formatQuestRewards(questId: string): string {
  const definition = getQuestDefinition(questId);
  if (!definition || !definition.rewards || definition.rewards.length === 0) {
    return '';
  }

  const rewardTexts = definition.rewards.map((reward) => {
    switch (reward.type) {
      case 'player_xp':
        return `+${reward.amount} Player XP`;
      case 'xp':
        const skillName = SKILL_DEFINITIONS[reward.skill]?.name ?? reward.skill;
        return `+${reward.amount} ${skillName} XP`;
      case 'resource':
        return `+${reward.amount} ${reward.resource}`;
      case 'item':
        return `+${reward.quantity} ${reward.itemId}`;
      default:
        return '';
    }
  }).filter(Boolean);

  return rewardTexts.join(', ');
}

/**
 * Register notification handlers with the event bus.
 * These handlers create notifications but don't modify game state.
 * Called once at module load time.
 */
export function registerNotificationHandlers(): void {
  registerOnce('notification-handlers', () => {
    // Quest completed notification
    eventBus.on('QUEST_COMPLETED', (event, state) => {
      if (notificationCallback) {
        const definition = getQuestDefinition(event.questId);
        if (definition) {
          const rewardsText = formatQuestRewards(event.questId);
          notificationCallback(
            'quest',
            'Quest Completed!',
            `${definition.icon} ${definition.name}${rewardsText ? ` - ${rewardsText}` : ''}`
          );
        }
      }
      return state;
    }, 200);

    // Achievement unlocked notification
    eventBus.on('ACHIEVEMENT_UNLOCKED', (event, state) => {
      if (notificationCallback) {
        const definition = getAchievementDefinition(event.achievementId);
        if (definition) {
          notificationCallback(
            'achievement',
            'Achievement Unlocked!',
            `${definition.icon} ${definition.name}`,
            { icon: definition.icon }
          );
        }
      }
      return state;
    }, 200);

    // Skill level up notification (for milestones - every 10 levels)
    eventBus.on('SKILL_LEVEL_UP', (event, state) => {
      if (notificationCallback) {
        // Only notify on milestone levels (every 10)
        if (event.newLevel % 10 === 0) {
          const skillDef = SKILL_DEFINITIONS[event.skillId];
          if (skillDef) {
            notificationCallback(
              'skill_level_up',
              `${skillDef.name} Level ${event.newLevel}!`,
              `You've reached level ${event.newLevel} in ${skillDef.name}!`,
              { icon: skillDef.icon }
            );
          }
        }
      }
      return state;
    }, 200);

    // Player level up notification (every level)
    eventBus.on('PLAYER_LEVEL_UP', (event, state) => {
      if (notificationCallback) {
        notificationCallback(
          'player_level_up',
          `Level ${event.newLevel}!`,
          `You've reached player level ${event.newLevel}!`
        );
      }
      return state;
    }, 200);

    // Combat notifications
    eventBus.on('COMBAT_ENEMY_KILLED', (event, state) => {
      if (notificationCallback) {
        notificationCallback(
          'combat',
          'Enemy Defeated!',
          `+${event.xpReward} Combat XP`
        );
      }
      return state;
    }, 200);

    eventBus.on('COMBAT_PLAYER_DIED', (_event, state) => {
      if (notificationCallback) {
        notificationCallback(
          'combat',
          'You Died!',
          'You were defeated in combat. Rest and try again.'
        );
      }
      return state;
    }, 200);
  });
}
