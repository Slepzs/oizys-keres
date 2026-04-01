const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialGameState } = require('../../game/save');
const { createCombatSlice } = require('./combatSlice');
const { createSkillsSlice } = require('./skillsSlice');

function createSliceHarness() {
  let state = createInitialGameState({ now: 0, rngSeed: 1 });

  const set = (partial) => {
    state = {
      ...state,
      ...partial,
    };
  };

  const get = () => state;
  const helpers = {};

  return {
    getState: () => state,
    combat: createCombatSlice(set, get, helpers),
    skills: createSkillsSlice(set, get, helpers),
  };
}

test('starting combat clears the active manual skill', () => {
  const harness = createSliceHarness();

  harness.skills.setActiveSkill('woodcutting');
  harness.combat.startCombat('sewers');

  assert.equal(harness.getState().activeSkill, null);
});

test('manual skills cannot be activated during combat', () => {
  const harness = createSliceHarness();

  harness.combat.startCombat('sewers');
  harness.skills.setActiveSkill('woodcutting');

  assert.equal(harness.getState().activeSkill, null);
});
