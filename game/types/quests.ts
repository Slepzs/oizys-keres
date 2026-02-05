import type { SkillId } from './skills';
import type { ResourceId } from './resources';
import type { ItemId } from './items';

// ============================================================================
// Objective Types
// ============================================================================

export type ObjectiveType =
  | 'gain_xp'
  | 'gain_resource'
  | 'collect_item'
  | 'have_item'
  | 'reach_level'
  | 'timer'
  | 'kill'
  | 'craft';

export type Objective =
  | { id: string; type: 'gain_xp'; target: SkillId; amount: number }
  | { id: string; type: 'gain_resource'; target: ResourceId; amount: number }
  | { id: string; type: 'collect_item'; target: ItemId; amount: number }
  | { id: string; type: 'have_item'; target: ItemId; amount: number }
  | { id: string; type: 'reach_level'; target: SkillId; level: number }
  | { id: string; type: 'timer'; durationMs: number }
  | { id: string; type: 'kill'; target: string; amount: number }
  | { id: string; type: 'craft'; target: ItemId; amount: number };

// ============================================================================
// Conditions for Unlock
// ============================================================================

export type QuestCondition =
  | { type: 'level_at_least'; skill: SkillId; value: number }
  | { type: 'quest_completed'; questId: string }
  | { type: 'resource_at_least'; resource: ResourceId; value: number }
  | { type: 'player_level_at_least'; value: number };

// ============================================================================
// Rewards
// ============================================================================

export type QuestReward =
  | { type: 'xp'; skill: SkillId; amount: number }
  | { type: 'player_xp'; amount: number }
  | { type: 'resource'; resource: ResourceId; amount: number }
  | { type: 'item'; itemId: ItemId; quantity: number };

// ============================================================================
// Quest Category
// ============================================================================

export type QuestCategory = 'main' | 'daily' | 'skill' | 'exploration';

// ============================================================================
// Quest Definition (Static Data)
// ============================================================================

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlock?: QuestCondition[];
  repeatable?: boolean;
  cooldownMs?: number;
  objectives: Objective[];
  rewards: QuestReward[];
  category?: QuestCategory;
}

// ============================================================================
// Player Quest State (Runtime - Minimal)
// ============================================================================

export interface PlayerQuestState {
  questId: string;
  progress: Record<string, number>; // objectiveId -> count
  completed: boolean;
  completedAt?: number;
  startedAt: number;
}

// ============================================================================
// Quests State (Full State Shape)
// ============================================================================

export interface QuestsState {
  active: PlayerQuestState[];
  completed: string[];
  completedCount: Record<string, number>; // For repeatables: questId -> completionCount
  lastCompletedAt: Record<string, number>; // For repeatables: questId -> timestamp
  totalCompleted: number;
}
