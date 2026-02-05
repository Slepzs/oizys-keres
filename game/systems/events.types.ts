import type { GameContext, GameState, SkillId, ItemId, CombatSkillId, ResourceId } from '../types';
import type { CraftingCategory, CraftingRecipeId, InfrastructureId } from '../types/crafting';

/**
 * Game events emitted by the tick system and other game logic.
 * These events are consumed by various handlers (quests, achievements, etc.)
 */
export type GameEvent =
  | { type: 'SKILL_ACTION'; skillId: SkillId; xpGained: number; resourceId: ResourceId; resourceGained: number }
  | { type: 'SKILL_LEVEL_UP'; skillId: SkillId; newLevel: number }
  | { type: 'PLAYER_LEVEL_UP'; newLevel: number }
  | { type: 'AUTOMATION_UNLOCKED'; skillId: SkillId }
  | { type: 'ITEM_DROPPED'; skillId: SkillId; itemId: ItemId; quantity: number }
  | { type: 'COMBAT_ITEM_DROPPED'; enemyId: string; itemId: ItemId; quantity: number }
  | { type: 'BAG_FULL'; itemId: ItemId; quantity: number }
  | { type: 'ACTIONS_PAUSED_BAG_FULL' }
  | { type: 'COINS_EARNED'; source: 'combat'; enemyId: string; amount: number }
  | { type: 'ITEM_CRAFTED'; recipeId: CraftingRecipeId; itemId: ItemId; quantity: number; category: CraftingCategory }
  | { type: 'INFRASTRUCTURE_BUILT'; infrastructureId: InfrastructureId; newLevel: number }
  | { type: 'QUEST_COMPLETED'; questId: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  // Combat events
  | { type: 'COMBAT_STARTED'; zoneId: string; enemyId: string }
  | { type: 'COMBAT_PLAYER_ATTACK'; damage: number; enemyHpRemaining: number }
  | { type: 'COMBAT_ENEMY_ATTACK'; damage: number; playerHpRemaining: number }
  | { type: 'COMBAT_ENEMY_KILLED'; enemyId: string; xpReward: number }
  | { type: 'COMBAT_PLAYER_DIED' }
  | { type: 'COMBAT_SKILL_LEVEL_UP'; skillId: CombatSkillId; newLevel: number };

/**
 * Event handler result type.
 * Handlers can return a new GameState directly or a result with follow-up events.
 */
export type EventHandlerResult =
  | GameState
  | { state: GameState; events?: GameEvent[] };

/**
 * Handler function type for a specific event type.
 * Returns a new GameState (immutable update).
 */
export type EventHandler<T extends GameEvent['type']> = (
  event: Extract<GameEvent, { type: T }>,
  state: GameState,
  ctx: GameContext
) => EventHandlerResult;
