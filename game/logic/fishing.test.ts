import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActiveFishingSpot,
  getFishingSpotsForLevel,
  setActiveFishingSpot,
} from './fishing.ts';

test('active fishing spot falls back when the selected spot needs an unowned rod', () => {
  const active = getActiveFishingSpot(
    { level: 35, activeFishingSpotId: 'bay' },
    { ownedRodIds: [] }
  );

  assert.equal(active.id, 'lake');
});

test('spot selection stays locked until the required rod is owned', () => {
  const unchanged = setActiveFishingSpot(
    { level: 35, xp: 0, automationUnlocked: false, automationEnabled: false, tickProgress: 0, activeFishingSpotId: 'lake' },
    'river',
    { ownedRodIds: [] }
  );

  assert.equal(unchanged.activeFishingSpotId, 'lake');

  const unlocked = setActiveFishingSpot(
    unchanged,
    'river',
    { ownedRodIds: ['river_rod'] }
  );

  assert.equal(unlocked.activeFishingSpotId, 'river');
});

test('available fishing spots only include waters unlocked by both level and rods', () => {
  const spots = getFishingSpotsForLevel(65, { ownedRodIds: ['river_rod'] });

  assert.deepEqual(
    spots.map((spot) => spot.id),
    ['pond', 'lake', 'river', 'bay']
  );
});
