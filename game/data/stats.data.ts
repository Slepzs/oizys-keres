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
