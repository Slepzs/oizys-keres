import type { StatCategory, StatDefinition } from '../../types';
import { STAT_DEFINITIONS } from '../../data/stats.data';

export function getAllStatDefinitions(): StatDefinition[] {
  return [...STAT_DEFINITIONS];
}

export function getStatDefinitionsByCategory(category: StatCategory): StatDefinition[] {
  return STAT_DEFINITIONS.filter((stat) => stat.category === category);
}
