import type { GameState, SkillId, ItemId } from '../types';

/**
 * Game events emitted by the tick system and other game logic.
 * These events are consumed by various handlers (quests, achievements, etc.)
 */
export type GameEvent =
  | { type: 'SKILL_ACTION'; skillId: SkillId; xpGained: number; resourceGained: number }
  | { type: 'SKILL_LEVEL_UP'; skillId: SkillId; newLevel: number }
  | { type: 'PLAYER_LEVEL_UP'; newLevel: number }
  | { type: 'AUTOMATION_UNLOCKED'; skillId: SkillId }
  | { type: 'ITEM_DROPPED'; skillId: SkillId; itemId: ItemId; quantity: number }
  | { type: 'BAG_FULL'; itemId: ItemId; quantity: number }
  | { type: 'ACTIONS_PAUSED_BAG_FULL' }
  | { type: 'QUEST_COMPLETED'; questId: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string };

/**
 * Handler function type for a specific event type.
 * Returns a new GameState (immutable update).
 */
export type EventHandler<T extends GameEvent['type']> = (
  event: Extract<GameEvent, { type: T }>,
  state: GameState
) => GameState;
