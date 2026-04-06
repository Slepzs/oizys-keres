import type { CombatAbilityCooldowns, CombatAbilityDefinition, CombatAbilityId } from '../types/combat';

export const COMBAT_ABILITY_DEFINITIONS: Record<CombatAbilityId, CombatAbilityDefinition> = {
  burst: {
    id: 'burst',
    label: 'Burst',
    description: 'Empower your next hit.',
    tone: 'attack',
    cooldownMs: 12_000,
  },
  guard: {
    id: 'guard',
    label: 'Guard',
    description: 'Reduce incoming damage for a short window.',
    tone: 'defense',
    cooldownMs: 14_000,
  },
  recover: {
    id: 'recover',
    label: 'Recover',
    description: 'Restore a chunk of HP instantly.',
    tone: 'support',
    cooldownMs: 18_000,
  },
};

export function createInitialCombatAbilityCooldowns(): CombatAbilityCooldowns {
  return {
    burst: 0,
    guard: 0,
    recover: 0,
  };
}
