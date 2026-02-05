import type { QuestDefinition, QuestsState } from '../types/quests';

// ============================================================================
// Quest Definitions
// ============================================================================

export const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  // Tutorial Chain
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Begin your journey with a real woodcutting shift.',
    icon: '🌲',
    category: 'main',
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 250 },
      { id: 'wood', type: 'gain_resource', target: 'wood', amount: 40 },
    ],
    rewards: [
      { type: 'player_xp', amount: 80 },
      { type: 'resource', resource: 'wood', amount: 30 },
    ],
  },

  wood_for_days: {
    id: 'wood_for_days',
    name: 'Wood for Days',
    description: 'Push woodcutting further and build a real stockpile.',
    icon: '🪵',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 1200 },
      { id: 'wood', type: 'gain_resource', target: 'wood', amount: 150 },
    ],
    rewards: [
      { type: 'player_xp', amount: 160 },
      { type: 'xp', skill: 'woodcutting', amount: 280 },
    ],
  },

  aspiring_lumberjack: {
    id: 'aspiring_lumberjack',
    name: 'Aspiring Lumberjack',
    description: 'Train woodcutting seriously and secure seed reserves.',
    icon: '🪓',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'wood_for_days' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'woodcutting', level: 8 },
      { id: 'seed_stock', type: 'have_item', target: 'tree_seed', amount: 4 },
    ],
    rewards: [
      { type: 'player_xp', amount: 220 },
      { type: 'resource', resource: 'wood', amount: 140 },
    ],
  },

  // Mining Chain
  pickaxe_ready: {
    id: 'pickaxe_ready',
    name: 'Pickaxe Ready',
    description: 'Prove you can mine consistently.',
    icon: '⛏️',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 250 },
      { id: 'ore', type: 'gain_resource', target: 'ore', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 85 },
    ],
  },

  ore_collector: {
    id: 'ore_collector',
    name: 'Ore Collector',
    description: 'Gather a serious ore haul for future crafting.',
    icon: '🪨',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'pickaxe_ready' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 1200 },
      { id: 'ore', type: 'gain_resource', target: 'ore', amount: 90 },
    ],
    rewards: [
      { type: 'player_xp', amount: 170 },
      { type: 'xp', skill: 'mining', amount: 280 },
    ],
  },

  // Crafting Chain
  forge_apprentice: {
    id: 'forge_apprentice',
    name: 'Forge Apprentice',
    description: 'Start training crafting beyond the basics.',
    icon: '🔨',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'ore_collector' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'crafting', amount: 250 },
      { id: 'ore', type: 'gain_resource', target: 'ore', amount: 60 },
    ],
    rewards: [
      { type: 'player_xp', amount: 110 },
    ],
  },

  forge_journeyman: {
    id: 'forge_journeyman',
    name: 'Forge Journeyman',
    description: 'Reach early crafting mastery with a full stone reserve.',
    icon: '⚒️',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'forge_apprentice' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'crafting', level: 7 },
      { id: 'ore', type: 'gain_resource', target: 'ore', amount: 180 },
    ],
    rewards: [
      { type: 'player_xp', amount: 200 },
      { type: 'resource', resource: 'ore', amount: 75 },
    ],
  },

  // Combat Quests
  sewers_cleanup: {
    id: 'sewers_cleanup',
    name: 'Sewers Cleanup',
    description: 'Thin out the giant rat population in the sewers.',
    icon: '🐀',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'rat_kills', type: 'kill', target: 'rat', amount: 15 },
    ],
    rewards: [
      { type: 'player_xp', amount: 120 },
      { type: 'resource', resource: 'stone', amount: 40 },
    ],
  },

  fang_stockpile: {
    id: 'fang_stockpile',
    name: 'Fang Stockpile',
    description: 'Defeat more rats and keep enough fangs in your bag.',
    icon: '🦷',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'sewers_cleanup' }],
    objectives: [
      { id: 'rat_kills', type: 'kill', target: 'rat', amount: 30 },
      { id: 'rat_fangs', type: 'have_item', target: 'rat_fang', amount: 8 },
    ],
    rewards: [
      { type: 'player_xp', amount: 180 },
      { type: 'item', itemId: 'rat_fang', quantity: 4 },
    ],
  },

  wolf_control: {
    id: 'wolf_control',
    name: 'Wolf Control',
    description: 'Push deeper into the sewers and bring back pelts.',
    icon: '🐺',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'fang_stockpile' }],
    objectives: [
      { id: 'wolf_kills', type: 'kill', target: 'wolf', amount: 10 },
      { id: 'pelts_in_bag', type: 'have_item', target: 'wolf_pelt', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 240 },
      { type: 'resource', resource: 'ore', amount: 90 },
    ],
  },

  goblin_intel: {
    id: 'goblin_intel',
    name: 'Goblin Intel',
    description: 'Defeat goblins and keep ears for proof of progress.',
    icon: '👺',
    category: 'exploration',
    unlock: [
      { type: 'quest_completed', questId: 'forge_journeyman' },
      { type: 'quest_completed', questId: 'wolf_control' },
    ],
    objectives: [
      { id: 'goblin_kills', type: 'kill', target: 'goblin', amount: 8 },
      { id: 'ears_in_bag', type: 'have_item', target: 'goblin_ear', amount: 3 },
    ],
    rewards: [
      { type: 'player_xp', amount: 320 },
      { type: 'item', itemId: 'goblin_ear', quantity: 2 },
    ],
  },

  // Daily Repeatables
  daily_woodcutter: {
    id: 'daily_woodcutter',
    name: 'Daily: Woodcutting',
    description: 'Complete your daily woodcutting shift.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'woodcutting', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 1200 },
    ],
    rewards: [
      { type: 'player_xp', amount: 75 },
      { type: 'resource', resource: 'wood', amount: 70 },
    ],
  },

  daily_miner: {
    id: 'daily_miner',
    name: 'Daily: Mining',
    description: 'Complete your daily mining shift.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'mining', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 1200 },
    ],
    rewards: [
      { type: 'player_xp', amount: 75 },
      { type: 'resource', resource: 'ore', amount: 45 },
    ],
  },

  daily_smith: {
    id: 'daily_smith',
    name: 'Daily: Crafting',
    description: 'Complete your daily crafting shift.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'crafting', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'crafting', amount: 900 },
    ],
    rewards: [
      { type: 'player_xp', amount: 70 },
      { type: 'resource', resource: 'stone', amount: 60 },
    ],
  },

  daily_hunter: {
    id: 'daily_hunter',
    name: 'Daily: Rat Hunt',
    description: 'Keep the sewers under control each day.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'player_level_at_least', value: 3 }],
    objectives: [
      { id: 'rat_kills', type: 'kill', target: 'rat', amount: 12 },
    ],
    rewards: [
      { type: 'player_xp', amount: 90 },
      { type: 'resource', resource: 'wood', amount: 40 },
    ],
  },

  // Item Collection Quests
  seed_collector: {
    id: 'seed_collector',
    name: 'Seed Collector',
    description: 'Collect and keep tree seeds in your bag.',
    icon: '🌱',
    category: 'exploration',
    unlock: [{ type: 'level_at_least', skill: 'woodcutting', value: 3 }],
    objectives: [
      { id: 'seeds', type: 'have_item', target: 'tree_seed', amount: 6 },
    ],
    rewards: [
      { type: 'player_xp', amount: 75 },
      { type: 'xp', skill: 'woodcutting', amount: 150 },
    ],
  },

  nest_warden: {
    id: 'nest_warden',
    name: 'Nest Warden',
    description: 'Find bird nests and keep them safe in your bag.',
    icon: '🪺',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'seed_collector' }],
    objectives: [
      { id: 'nests', type: 'have_item', target: 'bird_nest', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 160 },
      { type: 'resource', resource: 'wood', amount: 120 },
    ],
  },

  gem_finder: {
    id: 'gem_finder',
    name: 'Gem Finder',
    description: 'Find gems while mining.',
    icon: '💎',
    category: 'exploration',
    unlock: [{ type: 'level_at_least', skill: 'mining', value: 5 }],
    objectives: [
      { id: 'gems', type: 'collect_item', target: 'ruby', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 140 },
      { type: 'xp', skill: 'mining', amount: 280 },
    ],
  },

  sapphire_cache: {
    id: 'sapphire_cache',
    name: 'Sapphire Cache',
    description: 'Hold a small sapphire cache in your bag.',
    icon: '🔵',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'gem_finder' }],
    objectives: [
      { id: 'sapphires', type: 'have_item', target: 'sapphire', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 220 },
      { type: 'resource', resource: 'ore', amount: 110 },
    ],
  },
};

export const QUEST_IDS = Object.keys(QUEST_DEFINITIONS);

// ============================================================================
// Initial State Factory
// ============================================================================

export function createInitialQuestsState(): QuestsState {
  return {
    active: [],
    completed: [],
    completedCount: {},
    lastCompletedAt: {},
    totalCompleted: 0,
  };
}

// ============================================================================
// Helper: Get quest definition
// ============================================================================

export function getQuestDefinition(questId: string): QuestDefinition | undefined {
  return QUEST_DEFINITIONS[questId];
}
