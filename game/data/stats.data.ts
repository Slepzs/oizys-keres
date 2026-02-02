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
