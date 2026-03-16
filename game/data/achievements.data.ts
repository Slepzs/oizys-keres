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

  // Summoning achievements
  summoner_10: {
    id: 'summoner_10',
    name: 'Apprentice Summoner',
    description: 'Reach Summoning level 10',
    icon: '🔮',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'summoning', level: 10 },
    rewards: [{ type: 'multiplier', target: 'summoning', bonus: 0.05 }],
  },
  summoner_25: {
    id: 'summoner_25',
    name: 'Companion Binder',
    description: 'Reach Summoning level 25',
    icon: '🔮',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'summoning', level: 25 },
    rewards: [{ type: 'multiplier', target: 'summoning', bonus: 0.10 }],
  },
  summoner_50: {
    id: 'summoner_50',
    name: 'Pet Whisperer',
    description: 'Reach Summoning level 50',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'summoning', level: 50 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.05 }],
  },
  essence_collector: {
    id: 'essence_collector',
    name: 'Spirit Collector',
    description: 'Gather 100 Spirit Essence',
    icon: '✨',
    category: 'collection',
    condition: { type: 'total_resources', resourceId: 'spirit_essence', amount: 100 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.05 }],
  },

  // Combat level achievements
  combatant_5: {
    id: 'combatant_5',
    name: 'First Blood',
    description: 'Reach Combat level 5',
    icon: '⚔️',
    category: 'progression',
    condition: { type: 'combat_level', level: 5 },
  },
  combatant_10: {
    id: 'combatant_10',
    name: 'Apprentice Fighter',
    description: 'Reach Combat level 10',
    icon: '⚔️',
    category: 'skill',
    condition: { type: 'combat_level', level: 10 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.03 }],
  },
  combatant_25: {
    id: 'combatant_25',
    name: 'Seasoned Warrior',
    description: 'Reach Combat level 25',
    icon: '🗡️',
    category: 'skill',
    condition: { type: 'combat_level', level: 25 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.05 }],
  },
  combatant_50: {
    id: 'combatant_50',
    name: 'Elite Combatant',
    description: 'Reach Combat level 50',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'combat_level', level: 50 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.08 }],
  },
  combatant_75: {
    id: 'combatant_75',
    name: 'Battle Master',
    description: 'Reach Combat level 75',
    icon: '💀',
    category: 'skill',
    condition: { type: 'combat_level', level: 75 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.06 }],
  },

  // Kill count achievements
  kill_count_10: {
    id: 'kill_count_10',
    name: 'First Hunt',
    description: 'Defeat 10 enemies',
    icon: '🩸',
    category: 'progression',
    condition: { type: 'total_kills', count: 10 },
  },
  kill_count_100: {
    id: 'kill_count_100',
    name: 'Slayer',
    description: 'Defeat 100 enemies',
    icon: '💀',
    category: 'progression',
    condition: { type: 'total_kills', count: 100 },
    rewards: [{ type: 'multiplier', target: 'xp', bonus: 0.03 }],
  },
  kill_count_500: {
    id: 'kill_count_500',
    name: 'Mass Slaughter',
    description: 'Defeat 500 enemies',
    icon: '💀',
    category: 'progression',
    condition: { type: 'total_kills', count: 500 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.04 }],
  },
  kill_count_1000: {
    id: 'kill_count_1000',
    name: 'Warlord',
    description: 'Defeat 1,000 enemies',
    icon: '👑',
    category: 'progression',
    condition: { type: 'total_kills', count: 1000 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.05 }],
  },
  kill_count_5000: {
    id: 'kill_count_5000',
    name: 'Legendary Slayer',
    description: 'Defeat 5,000 enemies',
    icon: '🔥',
    category: 'progression',
    condition: { type: 'total_kills', count: 5000 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.07 }],
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
  player_level_50: {
    id: 'player_level_50',
    name: 'Champion',
    description: 'Reach player level 50',
    icon: '👑',
    category: 'progression',
    condition: { type: 'player_level', level: 50 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.08 }],
  },
  player_level_75: {
    id: 'player_level_75',
    name: 'Legend',
    description: 'Reach player level 75',
    icon: '🔱',
    category: 'progression',
    condition: { type: 'player_level', level: 75 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.12 }],
  },
  player_level_100: {
    id: 'player_level_100',
    name: 'Immortal',
    description: 'Reach player level 100',
    icon: '💫',
    category: 'progression',
    condition: { type: 'player_level', level: 100 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.20 }],
  },

  // High-tier skill achievements
  woodcutter_75: {
    id: 'woodcutter_75',
    name: 'Master Woodcutter',
    description: 'Reach Woodcutting level 75',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'woodcutting', level: 75 },
    rewards: [{ type: 'multiplier', target: 'woodcutting', bonus: 0.20 }],
  },
  miner_75: {
    id: 'miner_75',
    name: 'Master Miner',
    description: 'Reach Mining level 75',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'mining', level: 75 },
    rewards: [{ type: 'multiplier', target: 'mining', bonus: 0.20 }],
  },
  smith_75: {
    id: 'smith_75',
    name: 'Master Crafter',
    description: 'Reach Crafting level 75',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'crafting', level: 75 },
    rewards: [{ type: 'multiplier', target: 'crafting', bonus: 0.20 }],
  },
  summoner_75: {
    id: 'summoner_75',
    name: 'Grand Summoner',
    description: 'Reach Summoning level 75',
    icon: '🏆',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'summoning', level: 75 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.08 }],
  },

  // Late-game kill milestones
  kill_count_2000: {
    id: 'kill_count_2000',
    name: 'Executioner',
    description: 'Defeat 2,000 enemies',
    icon: '💀',
    category: 'progression',
    condition: { type: 'total_kills', count: 2000 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.06 }],
  },
  kill_count_10000: {
    id: 'kill_count_10000',
    name: 'Annihilator',
    description: 'Defeat 10,000 enemies',
    icon: '🩸',
    category: 'progression',
    condition: { type: 'total_kills', count: 10000 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.10 }],
  },

  // Late-game combat level milestones
  combatant_100: {
    id: 'combatant_100',
    name: 'Overlord',
    description: 'Reach Combat level 100',
    icon: '👹',
    category: 'skill',
    condition: { type: 'combat_level', level: 100 },
    rewards: [{ type: 'multiplier', target: 'drops', bonus: 0.12 }],
  },

  // Collection milestones for late-game ores
  spirit_essence_hoard: {
    id: 'spirit_essence_hoard',
    name: 'Spirit Hoarder',
    description: 'Gather 500 Spirit Essence',
    icon: '🌌',
    category: 'collection',
    condition: { type: 'total_resources', resourceId: 'spirit_essence', amount: 500 },
    rewards: [{ type: 'multiplier', target: 'summoning', bonus: 0.10 }],
  },

  // Quest progression milestones
  quest_master_100: {
    id: 'quest_master_100',
    name: 'Quest Legend',
    description: 'Complete 100 quests',
    icon: '📜',
    category: 'progression',
    condition: { type: 'quests_completed', count: 100 },
    rewards: [{ type: 'multiplier', target: 'all_skills', bonus: 0.15 }],
  },

  // Fishing achievements
  fisher_10: {
    id: 'fisher_10',
    name: 'Apprentice Fisher',
    description: 'Reach Fishing level 10',
    icon: '🎣',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'fishing', level: 10 },
    rewards: [{ type: 'multiplier', target: 'fishing', bonus: 0.05 }],
  },
  fisher_25: {
    id: 'fisher_25',
    name: 'Skilled Fisher',
    description: 'Reach Fishing level 25',
    icon: '🎣',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'fishing', level: 25 },
    rewards: [{ type: 'multiplier', target: 'fishing', bonus: 0.08 }],
  },
  fisher_50: {
    id: 'fisher_50',
    name: 'Expert Angler',
    description: 'Reach Fishing level 50',
    icon: '🦞',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'fishing', level: 50 },
    rewards: [{ type: 'multiplier', target: 'fishing', bonus: 0.10 }],
  },
  fisher_75: {
    id: 'fisher_75',
    name: 'Deep Sea Hunter',
    description: 'Reach Fishing level 75',
    icon: '🌍',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'fishing', level: 75 },
    rewards: [{ type: 'multiplier', target: 'fishing', bonus: 0.12 }],
  },
  fisher_99: {
    id: 'fisher_99',
    name: 'Master of the Depths',
    description: 'Reach Fishing level 99 — the abyss holds no secrets from you.',
    icon: '🦈',
    category: 'skill',
    condition: { type: 'skill_level', skillId: 'fishing', level: 99 },
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
