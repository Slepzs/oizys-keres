import type { GameState } from '@/game/types';
import { processOfflineProgress, processTick } from '@/game/logic';
import { eventBus } from '@/game/systems';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface TickSlice {
  tick: (deltaMs: number, now: number) => void;
  applyOfflineProgress: (now: number) => void;
}

export function createTickSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): TickSlice {
  return {
    tick: (deltaMs: number, now: number) => {
      const state = get();
      const ctx = helpers.getGameContext(now);
      const gameState = helpers.getGameStateSnapshot(state);
      const result = processTick(gameState, deltaMs, ctx);

      const finalState = eventBus.dispatch(result.events, result.state, ctx);

      const currentNotifications = get().notifications;

      let nextState: GameState = {
        ...finalState,
        notifications: currentNotifications,
        timestamps: {
          ...finalState.timestamps,
          lastActive: now,
        },
      };

      nextState = helpers.maybeAutoSave(nextState, now);

      set(nextState);
    },

    applyOfflineProgress: (now: number) => {
      const state = get();
      const ctx = helpers.getGameContext(now);
      const gameState = helpers.getGameStateSnapshot(state);

      const result = processOfflineProgress(gameState, now);
      const finalState = eventBus.dispatch(result.events, result.state, ctx);

      const currentNotifications = get().notifications;

      let nextState: GameState = {
        ...finalState,
        notifications: currentNotifications,
        timestamps: {
          ...finalState.timestamps,
          lastActive: now,
        },
      };

      nextState = helpers.maybeAutoSave(nextState, now);

      set(nextState);
    },
  };
}

