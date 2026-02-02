import type { GameContext, GameState } from '../types';
import type { GameEvent, EventHandlerResult } from './events.types';
import type { QuestsState, PlayerQuestState, Objective } from '../types/quests';
import { getQuestDefinition } from '../data/quests.data';
import { getQuestProgress, applyQuestRewards } from '../logic/quests';
import { checkAchievements } from '../logic/achievements';
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
      const progressDelta = getEventProgressDelta(event, objective, state);
      if (progressDelta > 0) {
        newProgress[objective.id] = (newProgress[objective.id] ?? 0) + progressDelta;
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

    const { allComplete } = getQuestProgress(updatedQuestState);
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
 * Calculate progress delta for a single event against a single objective.
 */
function getEventProgressDelta(
  event: GameEvent,
  objective: Objective,
  _gameState: GameState
): number {
  switch (event.type) {
    case 'SKILL_ACTION':
      if (objective.type === 'gain_xp' && objective.target === event.skillId) {
        return event.xpGained;
      }
      if (objective.type === 'gain_resource' && event.resourceGained > 0) {
        return event.resourceGained;
      }
      return 0;

    case 'SKILL_LEVEL_UP':
      if (objective.type === 'reach_level' && objective.target === event.skillId) {
        return event.newLevel;
      }
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
  });
}
