import type { MultiplierTarget } from '../types/multipliers';
import type { ItemId } from '../types/items';
import type { RareFishId } from '../types/skills';

export interface RareFishDefinition {
  id: RareFishId;
  name: string;
  description: string;
  icon: string;
  bonusTarget: MultiplierTarget;
  bonusValue: number;
  duplicateReward: {
    itemId: ItemId;
    quantity: number;
  };
}

export const RARE_FISH_DEFINITIONS: Record<RareFishId, RareFishDefinition> = {
  golden_minnow: {
    id: 'golden_minnow',
    name: 'Golden Minnow',
    description: 'A glittering starter legend that nudges every skill forward.',
    icon: '✨',
    bonusTarget: 'xp',
    bonusValue: 0.01,
    duplicateReward: {
      itemId: 'pearl',
      quantity: 1,
    },
  },
  moon_trout: {
    id: 'moon_trout',
    name: 'Moon Trout',
    description: 'A silver-blue river catch that sharpens fishing mastery.',
    icon: '🌙',
    bonusTarget: 'fishing',
    bonusValue: 0.02,
    duplicateReward: {
      itemId: 'oyster',
      quantity: 1,
    },
  },
  kingscale_salmon: {
    id: 'kingscale_salmon',
    name: 'Kingscale Salmon',
    description: 'A royal bay-runner that improves drop luck across the game.',
    icon: '👑',
    bonusTarget: 'drops',
    bonusValue: 0.02,
    duplicateReward: {
      itemId: 'pearl',
      quantity: 2,
    },
  },
  void_lanternfish: {
    id: 'void_lanternfish',
    name: 'Void Lanternfish',
    description: 'A trench-born beacon granting a serious fishing edge.',
    icon: '🕯️',
    bonusTarget: 'fishing',
    bonusValue: 0.04,
    duplicateReward: {
      itemId: 'oyster',
      quantity: 2,
    },
  },
  starglass_ray: {
    id: 'starglass_ray',
    name: 'Starglass Ray',
    description: 'A reef myth that boosts all-skill progression once secured.',
    icon: '🌠',
    bonusTarget: 'all_skills',
    bonusValue: 0.05,
    duplicateReward: {
      itemId: 'pearl',
      quantity: 3,
    },
  },
};

export const RARE_FISH_IDS = Object.keys(RARE_FISH_DEFINITIONS) as RareFishId[];
