const test = require('node:test');
const assert = require('node:assert/strict');

const { totalXpForCombatSkillLevel } = require('../../data/curves.ts');
const { COMBAT_ABILITY_DEFINITIONS } = require('../../data/combat-abilities.data.ts');
const { createInitialGameState } = require('../../save/initial-state.ts');
const { processTick } = require('../tick.ts');
const { startCombat, useCombatAbility } = require('./commands.ts');
const { calculateMaxHp } = require('./queries.ts');

function createCombatReadyState(now = 0) {
  let state = createInitialGameState({ now, rngSeed: 1 });
  const combatXp = totalXpForCombatSkillLevel(20);

  state = {
    ...state,
    combat: {
      ...state.combat,
      autoFight: false,
      combatSkills: {
        attack: { xp: combatXp },
        strength: { xp: combatXp },
        defense: { xp: combatXp },
      },
    },
  };

  const maxHp = calculateMaxHp(state.combat.combatSkills);
  state = {
    ...state,
    combat: {
      ...state.combat,
      playerMaxHp: maxHp,
      playerCurrentHp: maxHp,
    },
  };

  return {
    ...state,
    combat: startCombat(state.combat, 'sewers', now, 2.4),
  };
}

function getCombatEvent(events, type) {
  return events.find((event) => event.type === type);
}

test('recover heals immediately and starts its cooldown', () => {
  const state = createCombatReadyState();
  const damagedState = {
    ...state,
    combat: {
      ...state.combat,
      playerCurrentHp: 45,
    },
  };

  const result = useCombatAbility(damagedState.combat, 'recover', 1_000);

  assert.equal(result.success, true);
  assert.ok(result.state.playerCurrentHp > 45);
  assert.equal(
    result.state.abilityCooldowns.recover,
    1_000 + COMBAT_ABILITY_DEFINITIONS.recover.cooldownMs
  );
});

test('burst increases the next player hit and is consumed after the attack resolves', () => {
  const state = createCombatReadyState();
  const baselineResult = processTick(state, 3_000, { now: 3_000 });
  const burstCombat = useCombatAbility(state.combat, 'burst', 0);
  const burstState = {
    ...state,
    combat: burstCombat.state,
  };
  const buffedResult = processTick(burstState, 3_000, { now: 3_000 });

  assert.equal(burstCombat.success, true);
  assert.ok(
    getCombatEvent(buffedResult.events, 'COMBAT_PLAYER_ATTACK').damage
      > getCombatEvent(baselineResult.events, 'COMBAT_PLAYER_ATTACK').damage
  );
  assert.equal(buffedResult.state.combat.abilityEffects.burstReady, false);
});

test('guard reduces enemy damage while the effect is active', () => {
  const state = createCombatReadyState();
  const enemyTurnState = {
    ...state,
    combat: {
      ...state.combat,
      combatSkills: {
        ...state.combat.combatSkills,
        defense: { xp: 0 },
      },
      activeCombat: {
        ...state.combat.activeCombat,
        enemyId: 'orc',
        enemyCurrentHp: 120,
        playerNextAttackAt: 10_000,
        enemyNextAttackAt: 1_000,
      },
    },
  };

  const baselineResult = processTick(enemyTurnState, 2_000, { now: 2_000 });
  const guardedCombat = useCombatAbility(enemyTurnState.combat, 'guard', 0);
  const guardedState = {
    ...enemyTurnState,
    combat: guardedCombat.state,
  };
  const guardedResult = processTick(guardedState, 2_000, { now: 2_000 });

  assert.equal(guardedCombat.success, true);
  assert.ok(
    getCombatEvent(guardedResult.events, 'COMBAT_ENEMY_ATTACK').damage
      < getCombatEvent(baselineResult.events, 'COMBAT_ENEMY_ATTACK').damage
  );
});
