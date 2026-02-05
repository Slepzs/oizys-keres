import type {
  AttributeStatDefinition,
  AttributesState,
  SkillStatDefinition,
  SkillStatsState,
  StatDefinition,
} from '../types';
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
  {
    id: 'player_health',
    label: 'Health',
    category: 'attribute',
    order: 30,
  },
  {
    id: 'player_mana',
    label: 'Mana',
    category: 'attribute',
    order: 40,
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

export function createInitialAttributesState(): AttributesState {
  return {};
}

export function createInitialSkillStatsState(): SkillStatsState {
  return SKILL_IDS.reduce((state, skillId) => {
    state[skillId] = {
      level: 1,
      xp: 0,
    };
    return state;
  }, {} as SkillStatsState);
}
