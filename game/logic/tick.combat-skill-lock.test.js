const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialGameState } = require('../save');
const { startCombat } = require('./combat/commands');
const { processTick } = require('./tick');

test('active regular skills do not progress while combat is active', () => {
  let state = createInitialGameState({ now: 0, rngSeed: 1 });

  state = {
    ...state,
    activeSkill: 'woodcutting',
    combat: startCombat(state.combat, 'sewers', 0, 2.4),
  };

  const result = processTick(state, 3_000, { now: 3_000 });

  assert.equal(result.state.activeSkill, 'woodcutting');
  assert.equal(result.state.skills.woodcutting.xp, 0);
  assert.equal(result.state.skills.woodcutting.tickProgress, 0);
  assert.equal(result.state.resources.wood.amount, 0);
});
