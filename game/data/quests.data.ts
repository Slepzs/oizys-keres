import type { QuestDefinition, QuestsState } from '../types/quests';

// ============================================================================
// Quest Definitions
// ============================================================================

export const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  // Tutorial Chain
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Begin your journey by gathering some wood.',
    icon: '🌲',
    category: 'main',
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 100 },
    ],
    rewards: [
      { type: 'player_xp', amount: 50 },
    ],
  },

  wood_for_days: {
    id: 'wood_for_days',
    name: 'Wood for Days',
    description: 'Continue woodcutting and stockpile resources.',
    icon: '🪵',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 500 },
      { id: 'wood', type: 'gain_resource', target: 'wood', amount: 50 },
    ],
    rewards: [
      { type: 'player_xp', amount: 100 },
      { type: 'xp', skill: 'woodcutting', amount: 200 },
    ],
  },

  aspiring_lumberjack: {
    id: 'aspiring_lumberjack',
    name: 'Aspiring Lumberjack',
    description: 'Reach level 5 in woodcutting.',
    icon: '🪓',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'wood_for_days' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'woodcutting', level: 5 },
    ],
    rewards: [
      { type: 'player_xp', amount: 150 },
      { type: 'resource', resource: 'wood', amount: 100 },
    ],
  },

  // Mining Chain
  pickaxe_ready: {
    id: 'pickaxe_ready',
    name: 'Pickaxe Ready',
    description: 'Try your hand at mining.',
    icon: '⛏️',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 100 },
    ],
    rewards: [
      { type: 'player_xp', amount: 50 },
    ],
  },

  ore_collector: {
    id: 'ore_collector',
    name: 'Ore Collector',
    description: 'Gather a substantial amount of ore.',
    icon: '🪨',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'pickaxe_ready' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 500 },
      { id: 'ore', type: 'gain_resource', target: 'ore', amount: 30 },
    ],
    rewards: [
      { type: 'player_xp', amount: 100 },
      { type: 'xp', skill: 'mining', amount: 200 },
    ],
  },

  // Smithing Chain
  forge_apprentice: {
    id: 'forge_apprentice',
    name: 'Forge Apprentice',
    description: 'Begin learning the ways of smithing.',
    icon: '🔨',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'ore_collector' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'smithing', amount: 100 },
    ],
    rewards: [
      { type: 'player_xp', amount: 75 },
    ],
  },

  // Player Level Quests
  adventurer_level_5: {
    id: 'adventurer_level_5',
    name: 'Rising Adventurer',
    description: 'Reach player level 5.',
    icon: '⭐',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'player_level', type: 'reach_level', target: 'woodcutting', level: 5 },
    ],
    rewards: [
      { type: 'resource', resource: 'wood', amount: 50 },
      { type: 'resource', resource: 'ore', amount: 25 },
    ],
  },

  // Daily Repeatables
  daily_woodcutter: {
    id: 'daily_woodcutter',
    name: 'Daily: Woodcutting',
    description: 'Complete your daily woodcutting practice.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'woodcutting', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'woodcutting', amount: 1000 },
    ],
    rewards: [
      { type: 'player_xp', amount: 50 },
      { type: 'resource', resource: 'wood', amount: 50 },
    ],
  },

  daily_miner: {
    id: 'daily_miner',
    name: 'Daily: Mining',
    description: 'Complete your daily mining practice.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'mining', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'mining', amount: 1000 },
    ],
    rewards: [
      { type: 'player_xp', amount: 50 },
      { type: 'resource', resource: 'ore', amount: 30 },
    ],
  },

  daily_smith: {
    id: 'daily_smith',
    name: 'Daily: Smithing',
    description: 'Complete your daily smithing practice.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'smithing', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'smithing', amount: 1000 },
    ],
    rewards: [
      { type: 'player_xp', amount: 50 },
      { type: 'resource', resource: 'stone', amount: 30 },
    ],
  },

  // Item Collection Quests
  seed_collector: {
    id: 'seed_collector',
    name: 'Seed Collector',
    description: 'Collect tree seeds while woodcutting.',
    icon: '🌱',
    category: 'exploration',
    unlock: [{ type: 'level_at_least', skill: 'woodcutting', value: 3 }],
    objectives: [
      { id: 'seeds', type: 'collect_item', target: 'tree_seed', amount: 5 },
    ],
    rewards: [
      { type: 'player_xp', amount: 75 },
      { type: 'xp', skill: 'woodcutting', amount: 150 },
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
      { id: 'gems', type: 'collect_item', target: 'ruby', amount: 1 },
    ],
    rewards: [
      { type: 'player_xp', amount: 100 },
      { type: 'xp', skill: 'mining', amount: 250 },
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
