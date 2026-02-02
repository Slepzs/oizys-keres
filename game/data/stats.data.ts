import type { AttributeStatDefinition, SkillStatDefinition, StatDefinition } from '../types';
import { SKILL_DEFINITIONS, SKILL_IDS } from './skills.data';

const ATTRIBUTE_STATS: AttributeStatDefinition[] = [
  {
    id: 'player_level',
    label: 'Player Level',
    category: 'attribute',
    order: 10,
  },
  {
    id: 'player_xp',
    label: 'Player XP',
    category: 'attribute',
    order: 20,
  },
];

const SKILL_STATS: SkillStatDefinition[] = SKILL_IDS.map((skillId, index) => {
  const definition = SKILL_DEFINITIONS[skillId];
  return {
    id: skillId,
    skillId,
    label: definition.name,
    icon: definition.icon,
    category: 'skill',
    order: index + 1,
  };
});

export const STAT_DEFINITIONS: StatDefinition[] = [...ATTRIBUTE_STATS, ...SKILL_STATS];
import type {
  AttributeState,
  AttributesState,
  SkillStatState,
  SkillStatsState,
  SkillId,
} from '../types';
import { SKILL_IDS } from './skills.data';

export function createInitialAttributeState(): AttributeState {
  return {
    base: 0,
    bonus: 0,
    multiplier: 1,
  };
}

export function createInitialAttributesState(): AttributesState {
  return {};
}

export function createInitialSkillStatState(): SkillStatState {
  return {
    level: 1,
    xp: 0,
  };
}

export function createInitialSkillStatsState(): SkillStatsState {
  return SKILL_IDS.reduce((state, skillId) => {
    state[skillId] = createInitialSkillStatState();
    return state;
  }, {} as Record<SkillId, SkillStatState>);
}
export type StatCategory = 'attribute' | 'skill';

export type StatVisibility = 'visible' | 'hidden';

export type StatFormat = 'integer';

export type StatId =
  | 'health'
  | 'attack'
  | 'strength'
  | 'defense'
  | 'charisma'
  | 'intelligence'
  | 'woodcutting'
  | 'smithing'
  | 'mining';

export interface StatDefinition {
  id: StatId;
  label: string;
  category: StatCategory;
  description: string;
  icon: string;
  order: number;
  format?: StatFormat;
  visibility?: StatVisibility;
}

export const STAT_DEFINITIONS: Record<StatId, StatDefinition> = {
  health: {
    id: 'health',
    label: 'Health',
    category: 'attribute',
    description: 'Total vitality and survivability.',
    icon: '❤️',
    order: 1,
    format: 'integer',
    visibility: 'visible',
  },
  attack: {
    id: 'attack',
    label: 'Attack',
    category: 'attribute',
    description: 'Determines base damage output.',
    icon: '🗡️',
    order: 2,
    format: 'integer',
    visibility: 'visible',
  },
  strength: {
    id: 'strength',
    label: 'Strength',
    category: 'attribute',
    description: 'Improves physical power and effort.',
    icon: '💪',
    order: 3,
    format: 'integer',
    visibility: 'visible',
  },
  defense: {
    id: 'defense',
    label: 'Defense',
    category: 'attribute',
    description: 'Reduces incoming damage.',
    icon: '🛡️',
    order: 4,
    format: 'integer',
    visibility: 'visible',
  },
  charisma: {
    id: 'charisma',
    label: 'Charisma',
    category: 'attribute',
    description: 'Influences persuasion and social outcomes.',
    icon: '🗣️',
    order: 5,
    format: 'integer',
    visibility: 'visible',
  },
  intelligence: {
    id: 'intelligence',
    label: 'Intelligence',
    category: 'attribute',
    description: 'Boosts learning speed and analysis.',
    icon: '🧠',
    order: 6,
    format: 'integer',
    visibility: 'visible',
  },
  woodcutting: {
    id: 'woodcutting',
    label: 'Woodcutting',
    category: 'skill',
    description: 'Efficiency at harvesting wood.',
    icon: '🪓',
    order: 7,
    format: 'integer',
    visibility: 'visible',
  },
  smithing: {
    id: 'smithing',
    label: 'Smithing',
    category: 'skill',
    description: 'Skill in forging and crafting metal.',
    icon: '🔨',
    order: 8,
    format: 'integer',
    visibility: 'visible',
  },
  mining: {
    id: 'mining',
    label: 'Mining',
    category: 'skill',
    description: 'Effectiveness when extracting ore.',
    icon: '⛏️',
    order: 9,
    format: 'integer',
    visibility: 'visible',
  },
};

export const STAT_IDS: StatId[] = Object.values(STAT_DEFINITIONS)
  .sort((left, right) => left.order - right.order)
  .map((stat) => stat.id);
