import type { ShopOffer, ShopOfferId } from '../types/shop';
import { FISHING_RODS } from './fishing-rods.data';

export const SHOP_OFFER_IDS: ShopOfferId[] = [
  'premium_bag_tab',
  'fishing_rod_river',
  'fishing_rod_deepwater',
  'fishing_rod_abyssal',
  'fishing_rod_mythic',
  'supply_mystery_pack',
  'supply_bronze_pickaxe',
  'supply_bronze_hatchet',
  'supply_bronze_sword',
  'forge_sigil_mining_i',
  'forge_sigil_mining_ii',
  'forge_sigil_woodcutting_i',
  'forge_sigil_combat_i',
  'forge_sigil_combat_ii',
  'forge_sigil_wisdom',
];

export const SHOP_OFFERS: Record<ShopOfferId, ShopOffer> = {
  premium_bag_tab: {
    id: 'premium_bag_tab',
    tier: 'premium',
    name: 'Bag Tab Permit',
    description: 'Adds one extra tab to your bag (+20 slots).',
    icon: '🧾',
    pricing: {
      kind: 'exponential',
      currency: 'coins',
      baseAmount: 5_000,
      multiplier: 3,
      basedOn: 'bag_extra_tabs',
    },
    effect: {
      kind: 'bag_tab',
      tabs: 1,
    },
  },

  fishing_rod_river: {
    id: 'fishing_rod_river',
    tier: 'fishing',
    name: FISHING_RODS.river_rod.name,
    description: 'Unlocks the Mountain River and Coastal Bay fishing routes.',
    icon: FISHING_RODS.river_rod.icon,
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: FISHING_RODS.river_rod.priceCoins,
    },
    effect: {
      kind: 'unlock_fishing_rod',
      rodId: 'river_rod',
    },
  },

  fishing_rod_deepwater: {
    id: 'fishing_rod_deepwater',
    tier: 'fishing',
    name: FISHING_RODS.deepwater_rod.name,
    description: 'Unlocks the Deep Sea and Open Ocean fishing routes.',
    icon: FISHING_RODS.deepwater_rod.icon,
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: FISHING_RODS.deepwater_rod.priceCoins,
    },
    effect: {
      kind: 'unlock_fishing_rod',
      rodId: 'deepwater_rod',
    },
  },

  fishing_rod_abyssal: {
    id: 'fishing_rod_abyssal',
    tier: 'fishing',
    name: FISHING_RODS.abyssal_rod.name,
    description: 'Unlocks the Abyssal Trench and its highest-tier catches.',
    icon: FISHING_RODS.abyssal_rod.icon,
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: FISHING_RODS.abyssal_rod.priceCoins,
    },
    effect: {
      kind: 'unlock_fishing_rod',
      rodId: 'abyssal_rod',
    },
  },

  fishing_rod_mythic: {
    id: 'fishing_rod_mythic',
    tier: 'fishing',
    name: FISHING_RODS.mythic_rod.name,
    description: 'Unlocks Glacier Fjord, Storm Shelf, and Celestial Reef.',
    icon: FISHING_RODS.mythic_rod.icon,
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: FISHING_RODS.mythic_rod.priceCoins,
    },
    effect: {
      kind: 'unlock_fishing_rod',
      rodId: 'mythic_rod',
    },
  },

  supply_mystery_pack: {
    id: 'supply_mystery_pack',
    tier: 'normal',
    name: 'Prospector Pack',
    description: 'Open 1 pack for 5 pulls: mixed materials, gems, and rare gear upgrades.',
    icon: '🎁',
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: 1_500,
    },
    effect: {
      kind: 'open_gacha_pack',
      packId: 'shopkeeper_starter_pack',
    },
  },

  supply_bronze_pickaxe: {
    id: 'supply_bronze_pickaxe',
    tier: 'normal',
    name: 'Bronze Pickaxe',
    description: 'A sturdy pickaxe for mining rocks.',
    icon: '⛏️',
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: 250,
    },
    effect: {
      kind: 'grant_item',
      itemId: 'bronze_pickaxe',
      quantity: 1,
    },
  },

  supply_bronze_hatchet: {
    id: 'supply_bronze_hatchet',
    tier: 'normal',
    name: 'Bronze Hatchet',
    description: 'A reliable hatchet for chopping trees.',
    icon: '🪓',
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: 250,
    },
    effect: {
      kind: 'grant_item',
      itemId: 'bronze_hatchet',
      quantity: 1,
    },
  },

  supply_bronze_sword: {
    id: 'supply_bronze_sword',
    tier: 'normal',
    name: 'Bronze Sword',
    description: 'A basic sword made of bronze.',
    icon: '🗡️',
    pricing: {
      kind: 'fixed',
      currency: 'coins',
      amount: 500,
    },
    effect: {
      kind: 'grant_item',
      itemId: 'bronze_sword',
      quantity: 1,
    },
  },

  forge_sigil_mining_i: {
    id: 'forge_sigil_mining_i',
    tier: 'forge',
    name: 'Mithril Mining Sigil',
    description: 'Permanently enchant your pickaxe. Grants +8% mining XP forever.',
    icon: '🔷',
    pricing: {
      kind: 'resource',
      costs: [{ resourceId: 'mithril_ore', amount: 150 }],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_mining_i',
      target: 'mining',
      value: 0.08,
      multiplierType: 'additive',
    },
  },

  forge_sigil_mining_ii: {
    id: 'forge_sigil_mining_ii',
    tier: 'forge',
    name: 'Adamantite Mining Sigil',
    description: 'A powerful rune carved from the hardest ore. Grants +12% mining XP forever.',
    icon: '🟪',
    pricing: {
      kind: 'resource',
      costs: [{ resourceId: 'adamantite_ore', amount: 100 }],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_mining_ii',
      target: 'mining',
      value: 0.12,
      multiplierType: 'additive',
    },
  },

  forge_sigil_woodcutting_i: {
    id: 'forge_sigil_woodcutting_i',
    tier: 'forge',
    name: 'Mithril Lumberjack Sigil',
    description: 'Imbue your hatchet with mithril runes. Grants +8% woodcutting XP forever.',
    icon: '🪵',
    pricing: {
      kind: 'resource',
      costs: [{ resourceId: 'mithril_ore', amount: 150 }],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_woodcutting_i',
      target: 'woodcutting',
      value: 0.08,
      multiplierType: 'additive',
    },
  },

  forge_sigil_combat_i: {
    id: 'forge_sigil_combat_i',
    tier: 'forge',
    name: 'Mithril Battle Sigil',
    description: 'Forge a war rune from mithril. Grants +8% crafting XP forever.',
    icon: '⚔️',
    pricing: {
      kind: 'resource',
      costs: [{ resourceId: 'mithril_ore', amount: 150 }],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_combat_i',
      target: 'crafting',
      value: 0.08,
      multiplierType: 'additive',
    },
  },

  forge_sigil_combat_ii: {
    id: 'forge_sigil_combat_ii',
    tier: 'forge',
    name: 'Adamantite Warlord Sigil',
    description: 'The mightiest battle rune. Grants +12% XP to all gathering skills forever.',
    icon: '🗡️',
    pricing: {
      kind: 'resource',
      costs: [
        { resourceId: 'mithril_ore', amount: 100 },
        { resourceId: 'adamantite_ore', amount: 75 },
      ],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_combat_ii',
      target: 'all_skills',
      value: 0.12,
      multiplierType: 'additive',
    },
  },

  forge_sigil_wisdom: {
    id: 'forge_sigil_wisdom',
    tier: 'forge',
    name: 'Grand Sigil of Wisdom',
    description: 'The pinnacle of forge craft. Grants +5% XP to all skills forever.',
    icon: '✨',
    pricing: {
      kind: 'resource',
      costs: [
        { resourceId: 'mithril_ore', amount: 200 },
        { resourceId: 'adamantite_ore', amount: 100 },
      ],
    },
    effect: {
      kind: 'grant_multiplier',
      multiplierId: 'shop_forge_wisdom',
      target: 'all_skills',
      value: 0.05,
      multiplierType: 'additive',
    },
  },
};
