const test = require('node:test');
const assert = require('node:assert/strict');

const { totalXpForCombatSkillLevel } = require('../../data/curves.ts');
const { createInitialGameState } = require('../../save/initial-state.ts');
const { processTick } = require('../tick.ts');
const { startCombat } = require('./commands.ts');
const { calculateMaxHp } = require('./queries.ts');

test('enemy kill counters increment for the defeated enemy', () => {
  let state = createInitialGameState({ now: 0, rngSeed: 1 });
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

  state.combat.playerMaxHp = calculateMaxHp(state.combat.combatSkills);
  state.combat.playerCurrentHp = state.combat.playerMaxHp;
  state.combat = startCombat(state.combat, 'sewers', 0, 2.4);

  const result = processTick(state, 20_000, { now: 20_000 });

  assert.equal(result.state.combat.totalKills, 1);
  assert.equal(result.state.combat.enemyKillCounts.rat, 1);
  assert.equal(result.state.combat.enemyKillCounts.goblin ?? 0, 0);
});
