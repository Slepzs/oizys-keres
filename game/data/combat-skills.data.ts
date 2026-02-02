import type { CombatSkillDefinition, CombatSkillId, CombatSkillsState } from '../types/combat';

export const COMBAT_SKILL_DEFINITIONS: Record<CombatSkillId, CombatSkillDefinition> = {
  attack: {
    id: 'attack',
    name: 'Attack',
    description: 'Determines accuracy and ability to hit enemies.',
    icon: '⚔️',
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    description: 'Determines maximum damage dealt to enemies.',
    icon: '💪',
  },
  defense: {
    id: 'defense',
    name: 'Defense',
    description: 'Reduces damage taken from enemy attacks.',
    icon: '🛡️',
  },
};

export function createInitialCombatSkillsState(): CombatSkillsState {
  return {
    attack: { xp: 0 },
    strength: { xp: 0 },
    defense: { xp: 0 },
  };
}
