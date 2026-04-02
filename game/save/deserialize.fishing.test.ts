import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialGameState } from './initial-state.ts';
import { deserializeSave } from './deserialize.ts';

test('deserialize repairs missing fishing expansion fields with safe defaults', () => {
  const baseState = createInitialGameState({ now: 5_000, rngSeed: 17 });

  const result = deserializeSave({
    version: 20,
    savedAt: 5_000,
    state: {
      ...baseState,
      fishingGear: {
        ownedRodIds: ['river_rod'],
      } as any,
    },
  }, { now: 6_000 });

  assert.equal(result.success, true);
  assert.deepEqual(result.state.fishingGear, {
    ownedRodIds: ['river_rod'],
    ownedUpgradeIds: [],
    discoveredRareFishIds: [],
    activeUpgradePreset: 'supply',
  });
});
