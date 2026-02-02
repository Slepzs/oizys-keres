import type { SkillId } from './skills';
import type { ResourceId } from './resources';
import type { ItemId } from './items';

export type AchievementId = string;

export type AchievementCategory = 'skill' | 'collection' | 'progression' | 'secret';

/**
 * Conditions that must be met to unlock an achievement.
 */
export type AchievementCondition =
  | { type: 'skill_level'; skillId: SkillId; level: number }
  | { type: 'player_level'; level: number }
  | { type: 'total_resources'; resourceId: ResourceId; amount: number }
  | { type: 'items_collected'; itemId: ItemId; count: number }
  | { type: 'quests_completed'; count: number }
  | { type: 'skills_maxed'; count: number }
  | { type: 'any_skill_level'; level: number }
  | { type: 'total_items_collected'; itemId: ItemId; count: number };

/**
 * Rewards granted when an achievement is unlocked.
 */
export type AchievementReward =
  | { type: 'multiplier'; target: SkillId | 'all_skills' | 'xp' | 'drops'; bonus: number }
  | { type: 'unlock'; feature: string }
  | { type: 'resource'; resourceId: ResourceId; amount: number }
  | { type: 'item'; itemId: ItemId; quantity: number };

/**
 * Static definition of an achievement.
 */
export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  rewards?: AchievementReward[];
  /** If true, achievement is not shown until unlocked */
  hidden?: boolean;
}

/**
 * Player's achievement state.
 */
export interface AchievementsState {
  /** IDs of unlocked achievements */
  unlocked: AchievementId[];
  /** Timestamps when achievements were unlocked */
  unlockedAt: Record<AchievementId, number>;
  /** Progress toward cumulative achievements (e.g., total items collected) */
  progress: Record<AchievementId, number>;
}
