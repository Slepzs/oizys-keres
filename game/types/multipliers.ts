import type { SkillId } from './skills';

export type MultiplierSource = 'achievement' | 'upgrade' | 'equipment' | 'perk';
export type MultiplierTarget = SkillId | 'all_skills' | 'xp' | 'drops';

/**
 * A multiplier that affects game calculations.
 */
export interface Multiplier {
  id: string;
  source: MultiplierSource;
  target: MultiplierTarget;
  /** 'additive' bonuses sum together, 'multiplicative' bonuses multiply */
  type: 'additive' | 'multiplicative';
  /** Value of the bonus: 0.05 = +5% for additive, 1.5 = 1.5x for multiplicative */
  value: number;
}

/**
 * State for tracking active multipliers.
 */
export interface MultipliersState {
  active: Multiplier[];
}
