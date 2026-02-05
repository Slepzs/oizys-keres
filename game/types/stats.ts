import type { SkillId } from './skills';

export type StatCategory = 'attribute' | 'skill';
export type StatVisibility = 'visible' | 'hidden';
export type AttributeStatId = 'player_level' | 'player_xp' | 'player_health' | 'player_mana';

export interface BaseStatDefinition {
  id: string;
  label: string;
  category: StatCategory;
  order: number;
  visibility?: StatVisibility;
  icon?: string;
}

export interface AttributeStatDefinition extends BaseStatDefinition {
  id: AttributeStatId;
  category: 'attribute';
}

export interface SkillStatDefinition extends BaseStatDefinition {
  id: SkillId;
  skillId: SkillId;
  category: 'skill';
}

export type StatDefinition = AttributeStatDefinition | SkillStatDefinition;
