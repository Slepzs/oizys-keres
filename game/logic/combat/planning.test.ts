import test from 'node:test';
import assert from 'node:assert/strict';

import { totalXpForCombatSkillLevel } from '../../data/curves.ts';
import { createInitialGameState } from '../../save/initial-state.ts';
import { calculateMaxHp } from '../combat.ts';
import { estimateCombatRoute } from './planning.ts';

function withCombatLevel(level: number) {
  const xp = totalXpForCombatSkillLevel(level);
  const state = createInitialGameState({ now: 1_000, rngSeed: 7 });

  state.combat.combatSkills.attack.xp = xp;
  state.combat.combatSkills.strength.xp = xp;
  state.combat.combatSkills.defense.xp = xp;
  state.combat.playerMaxHp = calculateMaxHp(state.combat.combatSkills);
  state.combat.playerCurrentHp = state.combat.playerMaxHp;

  return state;
}

function asPlanningState(state: ReturnType<typeof createInitialGameState>) {
  return {
    bag: state.bag,
    combat: state.combat,
    summoning: state.summoning,
    summoningLevel: state.skills.summoning.level,
  };
}

test('active pets materially improve projected kill pace', () => {
  const withPet = withCombatLevel(20);
  const withoutPet = withCombatLevel(20);
  withoutPet.summoning.activePetId = null;

  const projectedWithPet = estimateCombatRoute(asPlanningState(withPet), 'skeleton');
  const projectedWithoutPet = estimateCombatRoute(asPlanningState(withoutPet), 'skeleton');

  assert.ok(projectedWithPet.totalDps > projectedWithoutPet.totalDps);
  assert.ok(projectedWithPet.timeToKillSeconds < projectedWithoutPet.timeToKillSeconds);
  assert.ok(projectedWithPet.xpPerMinute > projectedWithoutPet.xpPerMinute);
});

test('stocked food extends projected sustain for hard fights', () => {
  const starved = withCombatLevel(65);
  const supplied = withCombatLevel(65);

  supplied.bag.slots[0] = { itemId: 'shark', quantity: 20 };

  const starvedProjection = estimateCombatRoute(asPlanningState(starved), 'elder_demon');
  const suppliedProjection = estimateCombatRoute(asPlanningState(supplied), 'elder_demon');

  assert.ok(starvedProjection.netDamagePerKill > 0);
  assert.ok(suppliedProjection.totalHealingStock > starvedProjection.totalHealingStock);
  assert.ok(
    (suppliedProjection.killsBeforeRestock ?? 0) > (starvedProjection.killsBeforeRestock ?? 0)
  );
});

test('overmatched targets are flagged as lethal', () => {
  const state = createInitialGameState({ now: 1_000, rngSeed: 7 });

  const projection = estimateCombatRoute(asPlanningState(state), 'elder_demon');

  assert.equal(projection.risk, 'lethal');
  assert.ok(projection.killsBeforeRestock === 0 || projection.killsBeforeRestock === 1);
  assert.ok(projection.netDamagePerKill > state.combat.playerCurrentHp);
});
