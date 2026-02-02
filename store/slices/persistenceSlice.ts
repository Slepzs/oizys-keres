import type { GameState } from '@/game/types';
import { createInitialGameState, repairGameState } from '@/game/save';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface PersistenceSlice {
  flushSave: (now: number) => void;
  loadSave: (state: GameState) => void;
  reset: () => void;
}

export function createPersistenceSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): PersistenceSlice {
  return {
    flushSave: (now: number) => {
      const state = get();
      const gameState = helpers.getGameStateSnapshot(state);
      helpers.persistGameState(gameState, now);
      set({
        timestamps: {
          ...state.timestamps,
          lastSave: now,
        },
      });
    },

    loadSave: (newState: GameState) => {
      const now = Date.now();
      const repaired = repairGameState(newState, { now });
      helpers.persistGameState(repaired, now);
      set({
        ...repaired,
        isHydrated: true,
      });
    },

    reset: () => {
      const now = Date.now();
      const fresh = createInitialGameState({ now, rngSeed: helpers.createRngSeed() });
      helpers.persistGameState(fresh, now);
      set(fresh);
    },
  };
}

