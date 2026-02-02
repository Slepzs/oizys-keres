import type { GameState, SkillId } from '../types';
import type { Multiplier, MultiplierTarget, MultipliersState } from '../types/multipliers';

/**
 * Create initial multipliers state for new players.
 */
export function createInitialMultipliersState(): MultipliersState {
  return {
    active: [],
  };
}

/**
 * Add a multiplier to the game state.
 */
export function addMultiplier(state: GameState, multiplier: Multiplier): GameState {
  // Check if multiplier with same ID already exists
  const existingIndex = state.multipliers.active.findIndex(m => m.id === multiplier.id);

  if (existingIndex !== -1) {
    // Update existing multiplier
    const newActive = [...state.multipliers.active];
    newActive[existingIndex] = multiplier;
    return {
      ...state,
      multipliers: {
        ...state.multipliers,
        active: newActive,
      },
    };
  }

  // Add new multiplier
  return {
    ...state,
    multipliers: {
      ...state.multipliers,
      active: [...state.multipliers.active, multiplier],
    },
  };
}

/**
 * Remove a multiplier by ID.
 */
export function removeMultiplier(state: GameState, multiplierId: string): GameState {
  return {
    ...state,
    multipliers: {
      ...state.multipliers,
      active: state.multipliers.active.filter(m => m.id !== multiplierId),
    },
  };
}

/**
 * Get the effective multiplier for a specific target.
 * Combines all applicable multipliers (additive and multiplicative).
 *
 * Formula: (1 + sum of additive) * product of multiplicative
 *
 * @param state - Game state
 * @param target - Target to get multiplier for (skill ID or 'all_skills', 'xp', 'drops')
 * @returns Combined multiplier value (1.0 = no bonus)
 */
export function getEffectiveMultiplier(
  state: GameState,
  target: MultiplierTarget
): number {
  // Get multipliers that apply to this target
  const applicable = state.multipliers.active.filter(
    m => m.target === target || m.target === 'all_skills'
  );

  // Sum additive bonuses
  const additiveSum = applicable
    .filter(m => m.type === 'additive')
    .reduce((sum, m) => sum + m.value, 0);

  // Multiply multiplicative bonuses
  const multiplicativeProduct = applicable
    .filter(m => m.type === 'multiplicative')
    .reduce((product, m) => product * m.value, 1);

  return (1 + additiveSum) * multiplicativeProduct;
}

/**
 * Get the effective XP multiplier for a skill.
 * Includes both skill-specific and global XP multipliers.
 */
export function getSkillXpMultiplier(
  state: GameState,
  skillId: SkillId
): number {
  const skillMultiplier = getEffectiveMultiplier(state, skillId);
  const globalXpMultiplier = getEffectiveMultiplier(state, 'xp');

  return skillMultiplier * globalXpMultiplier;
}

/**
 * Get all multipliers from a specific source.
 */
export function getMultipliersBySource(
  state: GameState,
  source: Multiplier['source']
): Multiplier[] {
  return state.multipliers.active.filter(m => m.source === source);
}

/**
 * Get all multipliers affecting a specific target.
 */
export function getMultipliersForTarget(
  state: GameState,
  target: MultiplierTarget
): Multiplier[] {
  return state.multipliers.active.filter(
    m => m.target === target || m.target === 'all_skills'
  );
}

/**
 * Calculate total bonus percentage for display purposes.
 * Returns the bonus as a percentage (e.g., 15 for +15%).
 */
export function getTotalBonusPercentage(
  state: GameState,
  target: MultiplierTarget
): number {
  const multiplier = getEffectiveMultiplier(state, target);
  return Math.round((multiplier - 1) * 100);
}
