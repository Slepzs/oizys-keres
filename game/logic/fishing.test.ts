import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActiveFishingSpot,
  getFishingSpotsForLevel,
  resolveFishingActions,
  setActiveFishingSpot,
} from './fishing.ts';
import { createInitialFishingGearState } from '../data/fishing-rods.data.ts';

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

test('initial fishing gear includes expansion defaults for upgrades and discoveries', () => {
  assert.deepEqual(createInitialFishingGearState(), {
    ownedRodIds: [],
    ownedUpgradeIds: [],
    discoveredRareFishIds: [],
    activeUpgradePreset: 'supply',
  });
});

test('late fishing routes require the mythic rod in addition to level', () => {
  const withoutMythicRod = getFishingSpotsForLevel(99, {
    ownedRodIds: ['river_rod', 'deepwater_rod', 'abyssal_rod'] as any,
  });

  assert.deepEqual(
    withoutMythicRod.map((spot) => spot.id),
    ['pond', 'lake', 'river', 'bay', 'deep_sea', 'ocean', 'abyss']
  );

  const withMythicRod = getFishingSpotsForLevel(99, {
    ownedRodIds: ['river_rod', 'deepwater_rod', 'abyssal_rod', 'mythic_rod'] as any,
  });

  assert.deepEqual(
    withMythicRod.map((spot) => spot.id),
    [
      'pond',
      'lake',
      'river',
      'bay',
      'deep_sea',
      'ocean',
      'abyss',
      'glacier_fjord',
      'storm_shelf',
      'celestial_reef',
    ]
  );
});

test('weighted fishing catches resolve deterministically for the same seed', () => {
  const testSpot = {
    id: 'pond',
    name: 'Test Pond',
    description: 'Deterministic test spot',
    icon: '🎣',
    role: 'value',
    levelRequired: 1,
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shrimp',
    ticksPerAction: 30,
    catchTable: [
      {
        id: 'shrimp',
        weight: 3,
        minQuantity: 1,
        maxQuantity: 1,
        output: { kind: 'resource', resourceId: 'raw_shrimp' },
      },
      {
        id: 'pearl',
        weight: 1,
        minQuantity: 1,
        maxQuantity: 1,
        output: { kind: 'item', itemId: 'pearl' },
      },
    ],
    rareFishTable: [],
  } as any;

  const params = {
    spot: testSpot,
    actionsCompleted: 8,
    rngSeed: 12345,
    fishingGear: createInitialFishingGearState(),
  };

  assert.deepEqual(resolveFishingActions(params), resolveFishingActions(params));
});

test('rare fish bonuses are granted only on first catch and duplicates pay out value only', () => {
  const rareSpot = {
    id: 'pond',
    name: 'Rare Pond',
    description: 'Guaranteed rare-fish test spot',
    icon: '🎣',
    role: 'rare',
    levelRequired: 1,
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'raw_shrimp',
    ticksPerAction: 30,
    catchTable: [
      {
        id: 'shrimp',
        weight: 1,
        minQuantity: 1,
        maxQuantity: 1,
        output: { kind: 'resource', resourceId: 'raw_shrimp' },
      },
    ],
    rareFishTable: [
      {
        rareFishId: 'golden_minnow',
        chance: 1,
      },
    ],
  } as any;

  const firstCatch = resolveFishingActions({
    spot: rareSpot,
    actionsCompleted: 1,
    rngSeed: 77,
    fishingGear: createInitialFishingGearState(),
  });

  assert.deepEqual(firstCatch.discoveredRareFishIds, ['golden_minnow']);
  assert.equal(firstCatch.newMultipliers.length, 1);
  assert.deepEqual(firstCatch.items, []);

  const duplicateCatch = resolveFishingActions({
    spot: rareSpot,
    actionsCompleted: 1,
    rngSeed: 77,
    fishingGear: {
      ...createInitialFishingGearState(),
      discoveredRareFishIds: ['golden_minnow'],
    },
  });

  assert.deepEqual(duplicateCatch.discoveredRareFishIds, []);
  assert.deepEqual(duplicateCatch.newMultipliers, []);
  assert.deepEqual(duplicateCatch.items, [{ itemId: 'pearl', quantity: 1 }]);
});
