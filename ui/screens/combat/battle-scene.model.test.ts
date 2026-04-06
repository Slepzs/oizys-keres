import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBattleSceneModel } from './battle-scene.model.ts';

test('builds an active scene model with player, enemy, action slots, and no boss prompt shell by default', () => {
  const model = buildBattleSceneModel({
    activeCombat: {
      enemyId: 'rat',
      enemyCurrentHp: 12,
      playerCurrentHp: 70,
      playerMaxHp: 100,
      playerNextAttackAt: 1_000,
      enemyNextAttackAt: 1_200,
      petNextAttackAt: null,
      zoneId: 'sewers',
    },
    totalKills: 44,
    totalDeaths: 3,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: 3,
    now: 900,
  });

  assert.equal(model.state, 'active');
  if (model.state !== 'active') {
    assert.fail('expected active scene model');
  }
  assert.equal(model.player.hp.progress, 0.7);
  assert.equal(model.enemy.id, 'rat');
  assert.equal(model.enemy.telegraphState, 'charging');
  assert.equal(model.actionSlots.length, 4);
  assert.equal(model.bossPrompt, null);
});

test('builds an idle scene model with waiting copy when combat is inactive', () => {
  const model = buildBattleSceneModel({
    activeCombat: null,
    totalKills: 0,
    totalDeaths: 0,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: null,
    now: 900,
  });

  assert.equal(model.state, 'idle');
  if (model.state !== 'idle') {
    assert.fail('expected idle scene model');
  }
  assert.match(model.idleTitle, /awaiting/i);
  assert.equal(model.actionSlots.length, 4);
});

test('marks enemy telegraph as imminent when the next attack window is close', () => {
  const model = buildBattleSceneModel({
    activeCombat: {
      enemyId: 'rat',
      enemyCurrentHp: 12,
      playerCurrentHp: 70,
      playerMaxHp: 100,
      playerNextAttackAt: 1_600,
      enemyNextAttackAt: 1_050,
      petNextAttackAt: null,
      zoneId: 'sewers',
    },
    totalKills: 44,
    totalDeaths: 3,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: 3,
    now: 1_000,
  });

  if (model.state !== 'active') {
    assert.fail('expected active scene model');
  }
  assert.equal(model.enemy.telegraphState, 'imminent');
});
