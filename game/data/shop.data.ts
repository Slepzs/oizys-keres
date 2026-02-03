import type { ShopOffer, ShopOfferId } from '../types/shop';

export const SHOP_OFFER_IDS: ShopOfferId[] = [
  'premium_bag_tab',
  'supply_bronze_pickaxe',
  'supply_bronze_hatchet',
  'supply_bronze_sword',
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
};

