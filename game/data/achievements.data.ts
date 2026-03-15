import type { AchievementDefinition, AchievementsState } from '../types/achievements';

/**
 * Achievement definitions.
 */
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  // Progression achievements
  first_level: {
    id: 'first_level',
    name: 'Getting Started',
    description: 'Reach level 2 in any skill',
    icon: '⭐',
    category: 'progression',
    condition: { type: 'any_skill_level', level: 2 },
  },
  level_5_any: {
    id: 'level_5_any',
    name: 'Apprentice',
    description: 'Reach level 5 in any skill',
    icon: '📚',
    category: 'progression',
    condition: { type: 'any_skill_level', level: 5 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.02 }],
  },
  level_10_any: {
    id: 'level_10_any',
    name: 'Journeyman',
    description: 'Reach level 10 in any skill',
    icon: '🎓',
    category: 'progression',
    condition: { type: 'any_skill_level', level: 10 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.03 }],
  },

  // Woodcutting achievements
  woodcutter_10: {
    id: 'woodcutter_10',
    name: 'Apprentice Woodcutter',
    description: 'Reach Woodcutting level 10',
    icon: '🪓',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'woodcutting', level: 10 },
    rewards: [{ type: 'multiplier', target: 'woodcutting', bonus: 0.05 }],
  },
  woodcutter_25: {
    id: 'woodcutter_25',
    name: 'Skilled Woodcutter',
    description: 'Reach Woodcutting level 25',
    icon: '🪓',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'woodcutting', level: 25 },
    rewards: [{ type: 'multiplier', target: 'woodcutting', bonus: 0.10 }],
  },
  woodcutter_50: {
    id: 'woodcutter_50',
    name: 'Expert Woodcutter',
    description: 'Reach Woodcutting level 50',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'woodcutting', level: 50 },
    rewards: [{ type: 'multiplier', target: 'woodcutting', bonus: 0.15 }],
  },

  // Mining achievements
  miner_10: {
    id: 'miner_10',
    name: 'Apprentice Miner',
    description: 'Reach Mining level 10',
    icon: '⛏️',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'mining', level: 10 },
    rewards: [{ type: 'multiplier', target: 'mining', bonus: 0.05 }],
  },
  miner_25: {
    id: 'miner_25',
    name: 'Skilled Miner',
    description: 'Reach Mining level 25',
    icon: '⛏️',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'mining', level: 25 },
    rewards: [{ type: 'multiplier', target: 'mining', bonus: 0.10 }],
  },
  miner_50: {
    id: 'miner_50',
    name: 'Expert Miner',
    description: 'Reach Mining level 50',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'mining', level: 50 },
    rewards: [{ type: 'multiplier', target: 'mining', bonus: 0.15 }],
  },
  coal_stockpile: {
    id: 'coal_stockpile',
    name: 'Smelter Fuel',
    description: 'Gather 150 Coal',
    icon: '🖤',
    category: 'collection',
    condition: { type: 'total_resources', resourceId: 'coal', amount: 150 },
    rewards: [{ type: 'multiplier', target: 'crafting', bonus: 0.05 }],
  },
  mithril_stockpile: {
    id: 'mithril_stockpile',
    name: 'Mithril Prospector',
    description: 'Gather 100 Mithril Ore',
    icon: '💠',
    category: 'collection',
    condition: { type: 'total_resources', resourceId: 'mithril_ore', amount: 100 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.05 }],
  },
  adamantite_stockpile: {
    id: 'adamantite_stockpile',
    name: 'Deep Vein Harvester',
    description: 'Gather 75 Adamantite Ore',
    icon: '⬛',
    category: 'collection',
    condition: { type: 'total_resources', resourceId: 'adamantite_ore', amount: 75 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.04 }],
  },

  // Crafting achievements
  smith_10: {
    id: 'smith_10',
    name: 'Apprentice Crafter',
    description: 'Reach Crafting level 10',
    icon: '🔨',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'crafting', level: 10 },
    rewards: [{ type: 'multiplier', target: 'crafting', bonus: 0.05 }],
  },
  smith_25: {
    id: 'smith_25',
    name: 'Skilled Crafter',
    description: 'Reach Crafting level 25',
    icon: '🔨',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'crafting', level: 25 },
    rewards: [{ type: 'multiplier', target: 'crafting', bonus: 0.10 }],
  },
  smith_50: {
    id: 'smith_50',
    name: 'Expert Crafter',
    description: 'Reach Crafting level 50',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'crafting', level: 50 },
    rewards: [{ type: 'multiplier', target: 'crafting', bonus: 0.15 }],
  },

  // Quest achievements
  first_quest: {
    id: 'first_quest',
    name: 'Adventurer',
    description: 'Complete your first quest',
    icon: '📜',
    category: 'progression',
    condition: { type: 'quests_completed', count: 1 },
  },
  quest_master_10: {
    id: 'quest_master_10',
    name: 'Quest Enthusiast',
    description: 'Complete 10 quests',
    icon: '📜',
    category: 'progression',
    condition: { type: 'quests_completed', count: 10 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.05 }],
  },
  quest_master_50: {
    id: 'quest_master_50',
    name: 'Quest Master',
    description: 'Complete 50 quests',
    icon: '📜',
    category: 'progression',
    condition: { type: 'quests_completed', count: 50 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.10 }],
  },

  // Player level achievements
  player_level_5: {
    id: 'player_level_5',
    name: 'Rising Star',
    description: 'Reach player level 5',
    icon: '🌟',
    category: 'progression',
    condition: { type: 'player_level', level: 5 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.02 }],
  },
  player_level_10: {
    id: 'player_level_10',
    name: 'Established',
    description: 'Reach player level 10',
    icon: '🌟',
    category: 'progression',
    condition: { type: 'player_level', level: 10 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.03 }],
  },
  player_level_25: {
    id: 'player_level_25',
    name: 'Veteran',
    description: 'Reach player level 25',
    icon: '🌟',
    category: 'progression',
    condition: { type: 'player_level', level: 25 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.05 }],
  },
};

/**
 * Get achievement definition by ID.
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS[id];
}

/**
 * Create initial achievements state for new players.
 */
export function createInitialAchievementsState(): AchievementsState {
  return {
    unlocked: [],
    unlockedAt: {},
    progress: {},
  };
}
