import type { FishingUpgradeId, FishingUpgradePreset } from '../types/skills';

export type FishingUpgradeCategory = 'rig' | 'bait' | 'crew' | 'utility';

export interface FishingUpgradeDefinition {
  id: FishingUpgradeId;
  name: string;
  description: string;
  category: FishingUpgradeCategory;
  preset: FishingUpgradePreset;
}

export const FISHING_UPGRADES: Record<FishingUpgradeId, FishingUpgradeDefinition> = {
  float_rig: {
    id: 'float_rig',
    name: 'Float Rig',
    description: 'A light setup tuned for calmer XP-focused routes.',
    category: 'rig',
    preset: 'xp',
  },
  current_harness: {
    id: 'current_harness',
    name: 'Current Harness',
    description: 'Stabilizes river and bay casts for stronger supply output.',
    category: 'bait',
    preset: 'supply',
  },
  deepline_set: {
    id: 'deepline_set',
    name: 'Deepline Set',
    description: 'Heavy line assembly that favors value catches in deep waters.',
    category: 'utility',
    preset: 'value',
  },
  survey_crew: {
    id: 'survey_crew',
    name: 'Survey Crew',
    description: 'A permanent support team that improves fishing automation throughput.',
    category: 'crew',
    preset: 'supply',
  },
  rare_lure_assembly: {
    id: 'rare_lure_assembly',
    name: 'Rare Lure Assembly',
    description: 'A late-game lure kit designed for dedicated rare-hunt routes.',
    category: 'bait',
    preset: 'rare',
  },
};

export const FISHING_UPGRADE_IDS = Object.keys(FISHING_UPGRADES) as FishingUpgradeId[];
