import type { SkillDefinition, SkillId, SkillState, SkillsState } from '../types';

export const SKILL_DEFINITIONS: Record<SkillId, SkillDefinition> = {
  woodcutting: {
    id: 'woodcutting',
    name: 'Woodcutting',
    description: 'Chop trees to gather wood.',
    icon: '🪓',
    baseXpPerAction: 10,
    baseResourcePerAction: 1,
    resourceProduced: 'wood',
    automationUnlockLevel: 10,
    ticksPerAction: 30, // 3 seconds at 10 ticks/sec
  },
  mining: {
    id: 'mining',
    name: 'Mining',
    description: 'Mine rocks and ore deposits.',
    icon: '⛏️',
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'ore',
    automationUnlockLevel: 15,
    ticksPerAction: 40, // 4 seconds
  },
  smithing: {
    id: 'smithing',
    name: 'Smithing',
    description: 'Craft items from ore and other materials.',
    icon: '🔨',
    baseXpPerAction: 15,
    baseResourcePerAction: 1,
    resourceProduced: 'ore', // consumes ore, produces items later
    automationUnlockLevel: 20,
    ticksPerAction: 50, // 5 seconds
  },
};

export function createInitialSkillState(): SkillState {
  return {
    level: 1,
    xp: 0,
    automationUnlocked: false,
    automationEnabled: false,
  };
}

export function createInitialSkillsState(): SkillsState {
  return {
    woodcutting: createInitialSkillState(),
    mining: createInitialSkillState(),
    smithing: createInitialSkillState(),
  };
}

export const SKILL_IDS = Object.keys(SKILL_DEFINITIONS) as SkillId[];
