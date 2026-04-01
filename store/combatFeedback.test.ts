import test from 'node:test';
import assert from 'node:assert/strict';

import type { GameEvent } from '../game/systems/events.types';
import {
  applyCombatFeedbackEvents,
  createInitialCombatFeedback,
} from './combatFeedback.ts';

test('combat feedback maps only high-signal events into newest-first log entries', () => {
  const events: GameEvent[] = [
    { type: 'COMBAT_STARTED', zoneId: 'sewers', enemyId: 'rat' },
    { type: 'COMBAT_PLAYER_ATTACK', damage: 6, enemyHpRemaining: 4, isCritical: false },
    { type: 'COMBAT_ENEMY_ATTACK', damage: 2, playerHpRemaining: 98, isCritical: false },
    { type: 'COINS_EARNED', source: 'combat', enemyId: 'rat', amount: 3 },
    { type: 'COMBAT_PLAYER_REGEN', hpRestored: 1, playerHpAfter: 99 },
    { type: 'COMBAT_ENEMY_KILLED', enemyId: 'rat', xpReward: 10 },
    { type: 'COMBAT_ITEM_DROPPED', enemyId: 'rat', itemId: 'rat_fang', quantity: 1 },
  ];

  const namedResult = applyCombatFeedbackEvents(
    createInitialCombatFeedback(),
    events,
    1_000,
    null,
    {
      getEnemyName: (enemyId) => (enemyId === 'rat' ? 'Giant Rat' : enemyId),
      getItemName: (itemId) => (itemId === 'rat_fang' ? 'Rat Fang' : itemId),
    }
  );

  assert.equal(namedResult.killsThisSession, 1);
  assert.deepEqual(
    namedResult.entries.map((entry) => entry.text),
    [
      'Loot: Rat Fang x1',
      'Killed Giant Rat',
      'Regen +1 HP',
      'Giant Rat hits you for 2',
      'You hit Giant Rat for 6',
    ]
  );
});

test('combat feedback highlights crits and caps the rolling log length', () => {
  const start = createInitialCombatFeedback();
  const current = Array.from({ length: 12 }, (_, index) => ({
    id: `seed-${index}`,
    at: index,
    text: `Seed ${index}`,
  }));

  const result = applyCombatFeedbackEvents(
    {
      ...start,
      entries: current,
      killsThisSession: 2,
    },
    [{ type: 'COMBAT_PLAYER_ATTACK', damage: 12, enemyHpRemaining: 0, isCritical: true }],
    2_000
  );

  assert.equal(result.killsThisSession, 2);
  assert.equal(result.entries.length, 12);
  assert.equal(result.entries[0]?.text, 'Crit! You hit for 12');
  assert.equal(result.entries.at(-1)?.text, 'Seed 10');
});

test('combat feedback initializes session start on first activity and preserves it', () => {
  const started = applyCombatFeedbackEvents(
    createInitialCombatFeedback(),
    [{ type: 'COMBAT_PLAYER_REGEN', hpRestored: 1, playerHpAfter: 100 }],
    5_000
  );

  assert.equal(started.sessionStartedAt, 5_000);

  const continued = applyCombatFeedbackEvents(
    started,
    [{ type: 'COMBAT_PLAYER_REGEN', hpRestored: 2, playerHpAfter: 100 }],
    8_000
  );

  assert.equal(continued.sessionStartedAt, 5_000);
});
