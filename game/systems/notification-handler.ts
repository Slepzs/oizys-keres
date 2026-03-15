import { eventBus, registerOnce } from './events';
import { PET_DEFINITIONS, PET_EVOLUTION_STAGES } from '../data/summoning.data';
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
    eventBus.on('QUEST_COMPLETED', (event, state, _ctx) => {
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
    eventBus.on('ACHIEVEMENT_UNLOCKED', (event, state, _ctx) => {
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
    eventBus.on('SKILL_LEVEL_UP', (event, state, _ctx) => {
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
    eventBus.on('PLAYER_LEVEL_UP', (event, state, _ctx) => {
      if (notificationCallback) {
        notificationCallback(
          'player_level_up',
          `Level ${event.newLevel}!`,
          `You've reached player level ${event.newLevel}!`
        );
      }
      return state;
    }, 200);

    // Combat skill level up (every level — faster feedback than regular skills)
    eventBus.on('COMBAT_SKILL_LEVEL_UP', (event, state, _ctx) => {
      if (notificationCallback) {
        const skillNames: Record<string, string> = { attack: 'Attack', strength: 'Strength', defense: 'Defense' };
        const skillIcons: Record<string, string> = { attack: '⚔️', strength: '💪', defense: '🛡️' };
        const name = skillNames[event.skillId] ?? event.skillId;
        const icon = skillIcons[event.skillId] ?? '⚔️';
        notificationCallback(
          'skill_level_up',
          `${name} Level ${event.newLevel}!`,
          `${icon} Your ${name.toLowerCase()} skill reached level ${event.newLevel}.`,
          { icon }
        );
      }
      return state;
    }, 200);

    // Critical hit notification (only for big crits to avoid spam)
    eventBus.on('COMBAT_PLAYER_ATTACK', (event, state, _ctx) => {
      if (notificationCallback && event.isCritical && event.damage >= 10) {
        notificationCallback(
          'combat',
          'Critical Hit!',
          `You dealt ${event.damage} damage in one blow!`
        );
      }
      return state;
    }, 200);

    // Combat notifications
    eventBus.on('COMBAT_PLAYER_DIED', (_event, state, _ctx) => {
      if (notificationCallback) {
        notificationCallback(
          'combat',
          'You Died!',
          'You were defeated in combat. Rest and try again.'
        );
      }
      return state;
    }, 200);

    eventBus.on('PET_UNLOCKED', (event, state, _ctx) => {
      if (notificationCallback) {
        const pet = PET_DEFINITIONS[event.petId];
        if (pet) {
          notificationCallback(
            'achievement',
            `${pet.name} Joined You`,
            `${pet.icon} ${pet.passiveSummary}`,
            { icon: pet.icon }
          );
        }
      }
      return state;
    }, 200);

    eventBus.on('PET_LEVEL_UP', (event, state, _ctx) => {
      if (notificationCallback && event.newLevel % 5 === 0) {
        const pet = PET_DEFINITIONS[event.petId];
        if (pet) {
          notificationCallback(
            'skill_level_up',
            `${pet.name} Bond ${event.newLevel}`,
            `${pet.icon} Your bond with ${pet.name} reached level ${event.newLevel}.`,
            { icon: pet.icon }
          );
        }
      }
      return state;
    }, 200);

    eventBus.on('PET_EVOLVED', (event, state, _ctx) => {
      if (notificationCallback) {
        const pet = PET_DEFINITIONS[event.petId];
        const stage = PET_EVOLUTION_STAGES.find((candidate) => candidate.id === event.stageId);
        if (pet && stage) {
          notificationCallback(
            'achievement',
            `${pet.name} ${stage.name}`,
            `${pet.icon} ${pet.name} evolved into its ${stage.name.toLowerCase()} form.`,
            { icon: pet.icon }
          );
        }
      }
      return state;
    }, 200);
  });
}
