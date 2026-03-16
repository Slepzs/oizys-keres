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

  // Mining Tier Chain (continues from ore_collector)
  copper_vein: {
    id: 'copper_vein',
    name: 'Copper Vein',
    description: 'Reach copper-tier mining and build your first ore stockpile.',
    icon: '🟠',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'ore_collector' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'mining', level: 10 },
      { id: 'copper', type: 'gain_resource', target: 'copper_ore', amount: 50 },
    ],
    rewards: [
      { type: 'player_xp', amount: 250 },
      { type: 'xp', skill: 'mining', amount: 400 },
    ],
  },

  iron_hand: {
    id: 'iron_hand',
    name: 'Iron Hand',
    description: 'Push into iron-tier mining and gather enough for early crafting.',
    icon: '⚙️',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'copper_vein' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'mining', level: 25 },
      { id: 'iron', type: 'gain_resource', target: 'iron_ore', amount: 80 },
    ],
    rewards: [
      { type: 'player_xp', amount: 500 },
      { type: 'xp', skill: 'mining', amount: 800 },
    ],
  },

  coal_runner: {
    id: 'coal_runner',
    name: 'Coal Runner',
    description: 'Reach coal-tier and fuel your forge with a solid coal supply.',
    icon: '🖤',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'iron_hand' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'mining', level: 40 },
      { id: 'coal', type: 'gain_resource', target: 'coal', amount: 60 },
    ],
    rewards: [
      { type: 'player_xp', amount: 800 },
      { type: 'xp', skill: 'mining', amount: 1500 },
    ],
  },

  mithril_seeker: {
    id: 'mithril_seeker',
    name: 'Mithril Seeker',
    description: 'Unearth the legendary mithril veins and stockpile their ore.',
    icon: '🌀',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'coal_runner' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'mining', level: 55 },
      { id: 'mithril', type: 'gain_resource', target: 'mithril_ore', amount: 40 },
    ],
    rewards: [
      { type: 'player_xp', amount: 1400 },
      { type: 'xp', skill: 'mining', amount: 3000 },
    ],
  },

  adamantite_lord: {
    id: 'adamantite_lord',
    name: 'Adamantite Lord',
    description: 'Master the hardest ore in the realm — crack the adamantite seam.',
    icon: '💜',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'mithril_seeker' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'mining', level: 70 },
      { id: 'adamantite', type: 'gain_resource', target: 'adamantite_ore', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 2500 },
      { type: 'xp', skill: 'mining', amount: 6000 },
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

  // Mid/Late Combat Chain (continues from goblin_intel)
  crypt_clearer: {
    id: 'crypt_clearer',
    name: 'Crypt Clearer',
    description: 'Push into the Ancient Crypt and bring back proof of your kills.',
    icon: '💀',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'goblin_intel' }],
    objectives: [
      { id: 'skeleton_kills', type: 'kill', target: 'skeleton', amount: 10 },
      { id: 'shards', type: 'have_item', target: 'bone_shard', amount: 5 },
    ],
    rewards: [
      { type: 'player_xp', amount: 450 },
      { type: 'resource', resource: 'stone', amount: 150 },
    ],
  },

  undead_nemesis: {
    id: 'undead_nemesis',
    name: 'Undead Nemesis',
    description: 'Prove dominance in the crypt by putting down twenty skeletons.',
    icon: '🦴',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'crypt_clearer' }],
    objectives: [
      { id: 'skeleton_kills', type: 'kill', target: 'skeleton', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 600 },
      { type: 'resource', resource: 'ore', amount: 120 },
    ],
  },

  orc_bane: {
    id: 'orc_bane',
    name: 'Orc Bane',
    description: 'Storm the Orc Stronghold and collect trophies.',
    icon: '👹',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'undead_nemesis' }],
    objectives: [
      { id: 'orc_kills', type: 'kill', target: 'orc', amount: 8 },
      { id: 'tusks', type: 'have_item', target: 'orc_tusk', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 850 },
      { type: 'resource', resource: 'ore', amount: 200 },
    ],
  },

  stronghold_stormer: {
    id: 'stronghold_stormer',
    name: 'Stronghold Stormer',
    description: 'Drive the orcs from their stronghold entirely.',
    icon: '🏰',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'orc_bane' }],
    objectives: [
      { id: 'orc_kills', type: 'kill', target: 'orc', amount: 15 },
    ],
    rewards: [
      { type: 'player_xp', amount: 1200 },
      { type: 'resource', resource: 'copper_ore', amount: 100 },
    ],
  },

  troll_slayer: {
    id: 'troll_slayer',
    name: 'Troll Slayer',
    description: 'Venture into the Troll Caves and claim a troll trophy.',
    icon: '🧌',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'stronghold_stormer' }],
    objectives: [
      { id: 'troll_kills', type: 'kill', target: 'troll', amount: 6 },
      { id: 'toe', type: 'have_item', target: 'troll_toe', amount: 1 },
    ],
    rewards: [
      { type: 'player_xp', amount: 1600 },
      { type: 'resource', resource: 'iron_ore', amount: 80 },
    ],
  },

  troll_cave_purge: {
    id: 'troll_cave_purge',
    name: 'Cave Purge',
    description: 'Clear out the troll infestation from the deepest caves.',
    icon: '🕳️',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'troll_slayer' }],
    objectives: [
      { id: 'troll_kills', type: 'kill', target: 'troll', amount: 12 },
    ],
    rewards: [
      { type: 'player_xp', amount: 2000 },
      { type: 'resource', resource: 'coal', amount: 60 },
    ],
  },

  demon_contract: {
    id: 'demon_contract',
    name: 'Demon Contract',
    description: 'Descend into the Demonic Abyss and extract demon essence.',
    icon: '👿',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'troll_cave_purge' }],
    objectives: [
      { id: 'demon_kills', type: 'kill', target: 'demon', amount: 5 },
      { id: 'essence', type: 'have_item', target: 'demon_essence', amount: 1 },
    ],
    rewards: [
      { type: 'player_xp', amount: 2800 },
      { type: 'item', itemId: 'mithril_sword', quantity: 1 },
    ],
  },

  abyss_walker: {
    id: 'abyss_walker',
    name: 'Abyss Walker',
    description: 'Master the Demonic Abyss — no demon escapes your blade.',
    icon: '🔥',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'demon_contract' }],
    objectives: [
      { id: 'demon_kills', type: 'kill', target: 'demon', amount: 10 },
    ],
    rewards: [
      { type: 'player_xp', amount: 3500 },
      { type: 'resource', resource: 'mithril_ore', amount: 30 },
    ],
  },

  silencer: {
    id: 'silencer',
    name: 'The Silencer',
    description: 'Quiet the banshees of the Haunted Ruins and return with their wisps.',
    icon: '👻',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'abyss_walker' }],
    objectives: [
      { id: 'banshee_kills', type: 'kill', target: 'banshee', amount: 8 },
      { id: 'wisps', type: 'have_item', target: 'banshee_wisp', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 4500 },
      { type: 'resource', resource: 'spirit_essence', amount: 50 },
    ],
  },

  ruins_warden: {
    id: 'ruins_warden',
    name: 'Ruins Warden',
    description: 'Become the unchallenged protector of the Haunted Ruins.',
    icon: '🏚️',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'silencer' }],
    objectives: [
      { id: 'banshee_kills', type: 'kill', target: 'banshee', amount: 15 },
    ],
    rewards: [
      { type: 'player_xp', amount: 5500 },
      { type: 'item', itemId: 'runic_helmet', quantity: 1 },
    ],
  },

  dragonkin: {
    id: 'dragonkin',
    name: 'Dragonkin',
    description: "Slay dragon whelps in their volcanic lair and take their scales.",
    icon: '🐲',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'ruins_warden' }],
    objectives: [
      { id: 'dragon_kills', type: 'kill', target: 'dragon_whelp', amount: 5 },
      { id: 'scales', type: 'have_item', target: 'dragon_scale', amount: 2 },
    ],
    rewards: [
      { type: 'player_xp', amount: 7000 },
      { type: 'item', itemId: 'rune_sword', quantity: 1 },
    ],
  },

  elder_nemesis: {
    id: 'elder_nemesis',
    name: 'Elder Nemesis',
    description: 'Descend to the Abyssal Depths and slay an Elder Demon.',
    icon: '😈',
    category: 'exploration',
    unlock: [{ type: 'quest_completed', questId: 'dragonkin' }],
    objectives: [
      { id: 'elder_demon_kills', type: 'kill', target: 'elder_demon', amount: 3 },
      { id: 'core', type: 'have_item', target: 'elder_demon_core', amount: 1 },
    ],
    rewards: [
      { type: 'player_xp', amount: 10000 },
      { type: 'item', itemId: 'arcane_warblade', quantity: 1 },
    ],
  },

  // Summoning Chain
  first_ritual: {
    id: 'first_ritual',
    name: 'First Ritual',
    description: 'Channel your first summoning rituals and start accumulating spirit essence.',
    icon: '🔮',
    category: 'main',
    unlock: [{ type: 'quest_completed', questId: 'first_steps' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'summoning', amount: 250 },
      { id: 'essence', type: 'gain_resource', target: 'spirit_essence', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 110 },
      { type: 'xp', skill: 'summoning', amount: 200 },
    ],
  },

  bonded_companion: {
    id: 'bonded_companion',
    name: 'Bonded Companion',
    description: 'Deepen the bond with your companion through consistent ritual work.',
    icon: '🌟',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'first_ritual' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'summoning', level: 8 },
      { id: 'essence', type: 'gain_resource', target: 'spirit_essence', amount: 60 },
    ],
    rewards: [
      { type: 'player_xp', amount: 200 },
      { type: 'xp', skill: 'summoning', amount: 500 },
    ],
  },

  awakened_bond: {
    id: 'awakened_bond',
    name: 'Awakened Bond',
    description: 'Deepen your ritual practice until your companion awakens fully.',
    icon: '✨',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'bonded_companion' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'summoning', level: 18 },
      { id: 'essence', type: 'gain_resource', target: 'spirit_essence', amount: 120 },
    ],
    rewards: [
      { type: 'player_xp', amount: 350 },
      { type: 'xp', skill: 'summoning', amount: 1500 },
    ],
  },

  ascending_spirit: {
    id: 'ascending_spirit',
    name: 'Ascending Spirit',
    description: 'Channel enough essence to lift your companion into ascension.',
    icon: '🌙',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'awakened_bond' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'summoning', level: 30 },
      { id: 'essence', type: 'gain_resource', target: 'spirit_essence', amount: 300 },
    ],
    rewards: [
      { type: 'player_xp', amount: 700 },
      { type: 'xp', skill: 'summoning', amount: 4000 },
    ],
  },

  mythic_pact: {
    id: 'mythic_pact',
    name: 'Mythic Pact',
    description: 'Forge an unbreakable pact with a mythic-tier companion.',
    icon: '🌌',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'ascending_spirit' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'summoning', level: 60 },
      { id: 'essence', type: 'gain_resource', target: 'spirit_essence', amount: 800 },
    ],
    rewards: [
      { type: 'player_xp', amount: 1800 },
      { type: 'xp', skill: 'summoning', amount: 12000 },
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

  daily_summoner: {
    id: 'daily_summoner',
    name: 'Daily: Summoning',
    description: 'Complete your daily summoning rituals.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000, // 24 hours
    unlock: [{ type: 'level_at_least', skill: 'summoning', value: 5 }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'summoning', amount: 900 },
    ],
    rewards: [
      { type: 'player_xp', amount: 70 },
      { type: 'resource', resource: 'spirit_essence', amount: 15 },
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

  daily_goblin_hunt: {
    id: 'daily_goblin_hunt',
    name: 'Daily: Goblin Hunt',
    description: 'Keep the Goblin Forest in check.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000,
    unlock: [{ type: 'player_level_at_least', value: 6 }],
    objectives: [
      { id: 'goblin_kills', type: 'kill', target: 'goblin', amount: 8 },
    ],
    rewards: [
      { type: 'player_xp', amount: 120 },
      { type: 'resource', resource: 'ore', amount: 60 },
    ],
  },

  daily_undead_hunter: {
    id: 'daily_undead_hunter',
    name: 'Daily: Undead Hunt',
    description: 'Keep the undead in the crypt from spreading.',
    icon: '📅',
    category: 'daily',
    repeatable: true,
    cooldownMs: 86400000,
    unlock: [{ type: 'player_level_at_least', value: 12 }],
    objectives: [
      { id: 'skeleton_kills', type: 'kill', target: 'skeleton', amount: 6 },
    ],
    rewards: [
      { type: 'player_xp', amount: 180 },
      { type: 'resource', resource: 'stone', amount: 80 },
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

  // ==========================================================================
  // Fishing Chain
  // ==========================================================================
  first_cast: {
    id: 'first_cast',
    name: 'First Cast',
    description: 'Try your luck at the pond and reel in some shrimp.',
    icon: '🎣',
    category: 'skill',
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'fishing', amount: 200 },
      { id: 'shrimp', type: 'gain_resource', target: 'raw_shrimp', amount: 30 },
    ],
    rewards: [
      { type: 'player_xp', amount: 80 },
      { type: 'resource', resource: 'raw_shrimp', amount: 20 },
    ],
  },

  weekend_angler: {
    id: 'weekend_angler',
    name: 'Weekend Angler',
    description: 'Build a real stockpile and push deeper into the skill.',
    icon: '🪣',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'first_cast' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'fishing', amount: 1200 },
      { id: 'sardine', type: 'gain_resource', target: 'raw_sardine', amount: 50 },
    ],
    rewards: [
      { type: 'player_xp', amount: 160 },
      { type: 'xp', skill: 'fishing', amount: 300 },
    ],
  },

  river_run: {
    id: 'river_run',
    name: 'River Run',
    description: 'Head to the mountain river and catch trout.',
    icon: '🏞️',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'weekend_angler' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'fishing', level: 20 },
      { id: 'trout', type: 'gain_resource', target: 'raw_trout', amount: 40 },
    ],
    rewards: [
      { type: 'player_xp', amount: 240 },
      { type: 'xp', skill: 'fishing', amount: 500 },
    ],
  },

  deep_sea_expedition: {
    id: 'deep_sea_expedition',
    name: 'Deep Sea Expedition',
    description: 'Brave the open waters and haul in lobsters from the seabed.',
    icon: '🦞',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'river_run' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'fishing', level: 50 },
      { id: 'lobster', type: 'gain_resource', target: 'raw_lobster', amount: 30 },
    ],
    rewards: [
      { type: 'player_xp', amount: 400 },
      { type: 'xp', skill: 'fishing', amount: 1000 },
    ],
  },

  shark_hunter: {
    id: 'shark_hunter',
    name: 'Shark Hunter',
    description: 'Descend into the abyssal trench and face the apex predator.',
    icon: '🦈',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'deep_sea_expedition' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'fishing', level: 80 },
      { id: 'shark', type: 'gain_resource', target: 'raw_shark', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 700 },
      { type: 'xp', skill: 'fishing', amount: 2000 },
    ],
  },

  // Cooking Chain
  fire_it_up: {
    id: 'fire_it_up',
    name: 'Fire It Up',
    description: 'Light the cooking fire and turn your first catch into a meal.',
    icon: '🔥',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'first_cast' }],
    objectives: [
      { id: 'xp', type: 'gain_xp', target: 'cooking', amount: 300 },
      { id: 'shrimp', type: 'collect_item', target: 'shrimp', amount: 5 },
    ],
    rewards: [
      { type: 'player_xp', amount: 100 },
      { type: 'xp', skill: 'cooking', amount: 200 },
    ],
  },

  camp_cook: {
    id: 'camp_cook',
    name: 'Camp Cook',
    description: 'Refine your technique and build a stockpile of cooked food.',
    icon: '🍳',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'fire_it_up' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'cooking', level: 15 },
      { id: 'trout', type: 'collect_item', target: 'trout', amount: 10 },
    ],
    rewards: [
      { type: 'player_xp', amount: 200 },
      { type: 'xp', skill: 'cooking', amount: 500 },
    ],
  },

  seasoned_chef: {
    id: 'seasoned_chef',
    name: 'Seasoned Chef',
    description: 'Master intermediate recipes and keep yourself fed through hard battles.',
    icon: '🧑‍🍳',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'camp_cook' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'cooking', level: 30 },
      { id: 'salmon', type: 'collect_item', target: 'salmon', amount: 15 },
    ],
    rewards: [
      { type: 'player_xp', amount: 350 },
      { type: 'xp', skill: 'cooking', amount: 900 },
    ],
  },

  deep_sea_kitchen: {
    id: 'deep_sea_kitchen',
    name: 'Deep Sea Kitchen',
    description: 'Cook the finest catches from the deep ocean.',
    icon: '🦞',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'seasoned_chef' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'cooking', level: 50 },
      { id: 'lobster', type: 'collect_item', target: 'lobster', amount: 20 },
    ],
    rewards: [
      { type: 'player_xp', amount: 500 },
      { type: 'xp', skill: 'cooking', amount: 1500 },
    ],
  },

  shark_fin_feast: {
    id: 'shark_fin_feast',
    name: 'Shark Fin Feast',
    description: 'Only the best gear and rarest catches make it to your legendary table.',
    icon: '🦈',
    category: 'skill',
    unlock: [{ type: 'quest_completed', questId: 'deep_sea_kitchen' }],
    objectives: [
      { id: 'level', type: 'reach_level', target: 'cooking', level: 80 },
      { id: 'shark', type: 'collect_item', target: 'shark', amount: 10 },
    ],
    rewards: [
      { type: 'player_xp', amount: 800 },
      { type: 'xp', skill: 'cooking', amount: 2500 },
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
