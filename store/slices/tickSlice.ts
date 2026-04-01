import type { GameState } from '@/game/types';
import { processOfflineProgress, processTick } from '@/game/logic';
import { eventBus } from '@/game/systems';
import { ENEMY_DEFINITIONS, ITEM_DEFINITIONS } from '@/game/data';
import type { SliceGet, SliceSet, StoreHelpers } from './types';
import { applyCombatFeedbackEvents } from '@/store/combatFeedback';

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

      const combatFeedback = applyCombatFeedbackEvents(
        get().combatFeedback,
        result.events,
        now,
        gameState.combat.activeCombat?.enemyId,
        {
          getEnemyName: (enemyId) => ENEMY_DEFINITIONS[enemyId]?.name ?? enemyId,
          getItemName: (itemId) => ITEM_DEFINITIONS[itemId]?.name ?? itemId,
        }
      );

      set({
        ...nextState,
        combatFeedback,
      });
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
