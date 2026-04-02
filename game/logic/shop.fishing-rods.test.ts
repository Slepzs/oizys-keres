import test from 'node:test';
import assert from 'node:assert/strict';

import type { GameState } from '../types/index.ts';
import { createInitialGameState } from '../save/initial-state.ts';
import { buyShopOffer } from './shop.ts';

test('buying a fishing rod deducts coins and permanently unlocks the rod', () => {
  const baseState = createInitialGameState({ now: 1_000, rngSeed: 7 });
  const initial: GameState = {
    ...baseState,
    player: {
      ...baseState.player,
      coins: 5_000,
    },
    fishingGear: {
      ownedRodIds: [],
    },
  };

  const result = buyShopOffer(initial, 'fishing_rod_river', 1);

  assert.equal(result.success, true);
  assert.equal(result.state.player.coins, 3_800);
  assert.deepEqual(result.state.fishingGear.ownedRodIds, ['river_rod']);
});

test('owned fishing rods cannot be repurchased', () => {
  const baseState = createInitialGameState({ now: 1_000, rngSeed: 7 });
  const initial: GameState = {
    ...baseState,
    player: {
      ...baseState.player,
      coins: 5_000,
    },
    fishingGear: {
      ownedRodIds: ['river_rod'],
    },
  };

  const result = buyShopOffer(initial, 'fishing_rod_river', 1);

  assert.equal(result.success, false);
  assert.match(result.error ?? '', /already owned/i);
});
