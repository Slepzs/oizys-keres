import type { GameContext, GameState } from '../types';
import type { GameEvent, EventHandlerResult } from './events.types';
import type { PlayerQuestState, Objective } from '../types/quests';
import { getQuestDefinition } from '../data/quests.data';
import { getQuestProgress, applyQuestRewards } from '../logic/quests';
import { checkAchievements } from '../logic/achievements';
import { countItemInBag } from '../logic/bag';
import { eventBus, registerOnce } from './events';

/**
 * Process quest progress for events that contribute to objectives.
 * Returns updated game state with quest progress applied.
 */
function processQuestProgress(event: GameEvent, state: GameState, ctx: GameContext): EventHandlerResult {
  const { quests } = state;

  // Skip if no active quests
  if (quests.active.length === 0) {
    return state;
  }

  const completedQuests: string[] = [];
  const emittedEvents: GameEvent[] = [];
  let hasChanges = false;

  // Process each active quest
  const updatedActive = quests.active.map((questState) => {
    if (questState.completed) return questState;

    const definition = getQuestDefinition(questState.questId);
    if (!definition) return questState;

    let newProgress = { ...questState.progress };
    let questHasChanges = false;

    // Process event against objectives
    for (const objective of definition.objectives) {
      const currentProgress = newProgress[objective.id] ?? 0;
      const updatedProgress = getUpdatedObjectiveProgress(event, objective, state, currentProgress);
      if (updatedProgress !== currentProgress) {
        newProgress[objective.id] = updatedProgress;
        questHasChanges = true;
      }
    }

    if (!questHasChanges) return questState;
    hasChanges = true;

    // Check if quest is now complete
    const updatedQuestState: PlayerQuestState = {
      ...questState,
      progress: newProgress,
    };

    const { allComplete } = getQuestProgress(updatedQuestState, state);
    if (allComplete) {
      completedQuests.push(questState.questId);
      return {
        ...updatedQuestState,
        completed: true,
        completedAt: ctx.now,
      };
    }

    return updatedQuestState;
  });

  if (!hasChanges) {
    return state;
  }

  // Apply rewards for completed quests
  let newState: GameState = {
    ...state,
    quests: {
      ...quests,
      active: updatedActive,
    },
  };

  for (const questId of completedQuests) {
    const rewardResult = applyQuestRewards(newState, newState.quests, questId, ctx.now);
    newState = { ...rewardResult.state, quests: rewardResult.quests };

    // Check achievements for quest completion
    const questCompletedEvent: GameEvent = { type: 'QUEST_COMPLETED', questId };
    newState = checkAchievements(newState, questCompletedEvent, ctx);
    emittedEvents.push(questCompletedEvent);
  }

  return emittedEvents.length > 0 ? { state: newState, events: emittedEvents } : newState;
}

/**
 * Calculate updated progress for a single event against a single objective.
 */
function getUpdatedObjectiveProgress(
  event: GameEvent,
  objective: Objective,
  gameState: GameState,
  currentProgress: number
): number {
  if (objective.type === 'have_item') {
    return countItemInBag(gameState.bag, objective.target);
  }

  switch (event.type) {
    case 'SKILL_ACTION':
      if (objective.type === 'gain_xp' && objective.target === event.skillId) {
        return currentProgress + event.xpGained;
      }
      if (
        objective.type === 'gain_resource' &&
        objective.target === event.resourceId &&
        event.resourceGained > 0
      ) {
        return currentProgress + event.resourceGained;
      }
      return currentProgress;

    case 'SKILL_LEVEL_UP':
      if (objective.type === 'reach_level' && objective.target === event.skillId) {
        return Math.max(currentProgress, event.newLevel);
      }
      return currentProgress;

    case 'ITEM_DROPPED':
      if (objective.type === 'collect_item' && objective.target === event.itemId) {
        return currentProgress + event.quantity;
      }
      return currentProgress;

    case 'COMBAT_ITEM_DROPPED':
      if (objective.type === 'collect_item' && objective.target === event.itemId) {
        return currentProgress + event.quantity;
      }
      return currentProgress;

    case 'ITEM_CRAFTED':
      if (objective.type === 'craft' && objective.target === event.itemId) {
        return currentProgress + event.quantity;
      }
      if (objective.type === 'collect_item' && objective.target === event.itemId) {
        return currentProgress + event.quantity;
      }
      return currentProgress;

    case 'COMBAT_ENEMY_KILLED':
      if (objective.type === 'kill' && objective.target === event.enemyId) {
        return currentProgress + 1;
      }
      return currentProgress;

    default:
      return currentProgress;
  }
}

/**
 * Register quest handlers with the event bus.
 * Should be called once during app initialization.
 */
export function registerQuestHandlers(): void {
  registerOnce('quest-handlers', () => {
    // Register handlers for all events that can progress quests
    // Priority 50 ensures quests process before achievements (which use priority 100)
    eventBus.on('SKILL_ACTION', processQuestProgress, 50);
    eventBus.on('SKILL_LEVEL_UP', processQuestProgress, 50);
    eventBus.on('ITEM_DROPPED', processQuestProgress, 50);
    eventBus.on('COMBAT_ITEM_DROPPED', processQuestProgress, 50);
    eventBus.on('ITEM_CRAFTED', processQuestProgress, 50);
    eventBus.on('COMBAT_ENEMY_KILLED', processQuestProgress, 50);
  });
}
