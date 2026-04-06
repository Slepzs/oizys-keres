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
    abilityCooldowns: {
      burst: 0,
      guard: 0,
      recover: 0,
    },
    abilityEffects: {
      burstReady: false,
      guardExpiresAt: 0,
    },
    now: 900,
  });

  assert.equal(model.state, 'active');
  if (model.state !== 'active') {
    assert.fail('expected active scene model');
  }
  assert.equal(model.player.hp.progress, 0.7);
  assert.equal(model.enemy.id, 'rat');
  assert.equal(model.enemy.telegraphState, 'charging');
  assert.equal(model.actionSlots.length, 3);
  assert.equal(model.actionSlots[0].isReady, true);
  assert.equal(model.bossPrompt, null);
});

test('builds an idle scene model with waiting copy when combat is inactive', () => {
  const model = buildBattleSceneModel({
    activeCombat: null,
    totalKills: 0,
    totalDeaths: 0,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: null,
    abilityCooldowns: {
      burst: 0,
      guard: 0,
      recover: 0,
    },
    abilityEffects: {
      burstReady: false,
      guardExpiresAt: 0,
    },
    now: 900,
  });

  assert.equal(model.state, 'idle');
  if (model.state !== 'idle') {
    assert.fail('expected idle scene model');
  }
  assert.match(model.idleTitle, /awaiting/i);
  assert.equal(model.actionSlots.length, 3);
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
    abilityCooldowns: {
      burst: 0,
      guard: 0,
      recover: 0,
    },
    abilityEffects: {
      burstReady: false,
      guardExpiresAt: 0,
    },
    now: 1_000,
  });

  if (model.state !== 'active') {
    assert.fail('expected active scene model');
  }
  assert.equal(model.enemy.telegraphState, 'imminent');
});

test('builds cooldown and active markers for combat abilities', () => {
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
    abilityCooldowns: {
      burst: 3_000,
      guard: 0,
      recover: 0,
    },
    abilityEffects: {
      burstReady: true,
      guardExpiresAt: 5_000,
    },
    now: 1_000,
  });

  if (model.state !== 'active') {
    assert.fail('expected active scene model');
  }

  const burst = model.actionSlots.find((slot) => slot.id === 'burst');
  const guard = model.actionSlots.find((slot) => slot.id === 'guard');

  assert.equal(burst?.isReady, false);
  assert.equal(burst?.cooldownRemainingMs, 2_000);
  assert.equal(burst?.isActive, true);
  assert.equal(guard?.isActive, true);
});
