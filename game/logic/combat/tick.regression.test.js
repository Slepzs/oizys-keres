const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialGameState } = require('../../save');
const { startCombat } = require('./commands');
const { processTick } = require('../tick');

test('pet kill chains still respect the pet attack cooldown after an enemy respawns', () => {
  let state = createInitialGameState({ now: 0, rngSeed: 1 });

  state = {
    ...state,
    skills: {
      ...state.skills,
      summoning: {
        ...state.skills.summoning,
        level: 99,
      },
    },
    summoning: {
      ...state.summoning,
      activePetId: 'void_mantis',
      pets: {
        ...state.summoning.pets,
        void_mantis: {
          unlocked: true,
          level: 50,
          xp: 0,
          ritualsChanneled: 0,
          combatKills: 0,
        },
      },
    },
    combat: {
      ...state.combat,
      autoFight: true,
      selectedEnemyByZone: {
        sewers: 'rat',
      },
    },
  };

  state = {
    ...state,
    combat: startCombat(state.combat, 'sewers', 0, 2.4),
  };

  const result = processTick(state, 100, { now: 100 });
  const activeCombat = result.state.combat.activeCombat;

  assert.equal(result.state.combat.totalKills, 1);
  assert.ok(activeCombat, 'combat should continue after the first kill');
  assert.ok(
    activeCombat.petNextAttackAt > 100,
    `expected pet cooldown to push the next attack into the future, got ${activeCombat.petNextAttackAt}`
  );
});
