import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateScaledCombatDamage,
  scaleCombatOffenseBonus,
  scaleAttackIntervalSeconds,
  scaleEnemyMaxHp,
  scalePetBaseDamage,
} from './balance.ts';

test('offensive combat bonuses scale down instead of exploding linearly', () => {
  assert.equal(scaleCombatOffenseBonus(3), 1);
  assert.equal(scaleCombatOffenseBonus(11), 4);
  assert.equal(scaleCombatOffenseBonus(30), 12);
});

test('combat damage grows more slowly than flat strength minus defense', () => {
  assert.equal(calculateScaledCombatDamage(2, 0), 1);
  assert.equal(calculateScaledCombatDamage(12, 10), 4);
  assert.equal(calculateScaledCombatDamage(28, 10), 9);
});

test('enemy hp scaling stretches fights into longer windows', () => {
  assert.equal(scaleEnemyMaxHp(10), 20);
  assert.equal(scaleEnemyMaxHp(70), 140);
  assert.equal(scaleEnemyMaxHp(420), 840);
});

test('pet base damage is reduced to a support role instead of dominant dps', () => {
  assert.equal(scalePetBaseDamage(5), 2);
  assert.equal(scalePetBaseDamage(20), 9);
  assert.equal(scalePetBaseDamage(45), 20);
});

test('attack intervals are doubled for slower combat cadence', () => {
  assert.equal(scaleAttackIntervalSeconds(0.8), 1.6);
  assert.equal(scaleAttackIntervalSeconds(2.4), 4.8);
  assert.equal(scaleAttackIntervalSeconds(3.3), 6.6);
});
