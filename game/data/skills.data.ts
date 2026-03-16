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
  crafting: {
    id: 'crafting',
    name: 'Crafting',
    description: 'Turn gathered materials into tools, gear, and infrastructure.',
    icon: '🔨',
    baseXpPerAction: 0,
    baseResourcePerAction: 0,
    resourceProduced: 'ore',
    automationUnlockLevel: 1,
    ticksPerAction: 45, // Used by auto-crafting cadence
  },
  summoning: {
    id: 'summoning',
    name: 'Summoning',
    description: 'Perform spirit rituals to unlock companions and feed their bond.',
    icon: '🔮',
    baseXpPerAction: 16,
    baseResourcePerAction: 2,
    resourceProduced: 'spirit_essence',
    automationUnlockLevel: 12,
    ticksPerAction: 50,
  },
  fishing: {
    id: 'fishing',
    name: 'Fishing',
    description: 'Cast your line and reel in fish from ponds, rivers, and the deep sea.',
    icon: '🎣',
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shrimp',
    automationUnlockLevel: 20,
    ticksPerAction: 30,
  },
};

export function createInitialSkillState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    level: 1,
    xp: 0,
    automationUnlocked: false,
    automationEnabled: false,
    tickProgress: 0,
    ...overrides,
  };
}

export function createInitialSkillsState(): SkillsState {
  return {
    woodcutting: createInitialSkillState(),
    mining: createInitialSkillState(),
    crafting: createInitialSkillState({ automationUnlocked: true }),
    summoning: createInitialSkillState(),
    fishing: createInitialSkillState(),
  };
}

export const SKILL_IDS = Object.keys(SKILL_DEFINITIONS) as SkillId[];
