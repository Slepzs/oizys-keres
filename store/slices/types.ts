import type { StoreApi } from 'zustand';
import type { GameContext, GameState } from '@/game/types';
import type { GameStore } from '../gameStore';

export type SliceSet = StoreApi<GameStore>['setState'];
export type SliceGet = StoreApi<GameStore>['getState'];

export interface StoreHelpers {
  getGameContext: (now: number) => GameContext;
  getGameStateSnapshot: (store: GameStore) => GameState;
  persistGameState: (gameState: GameState, now: number) => void;
  maybeAutoSave: (gameState: GameState, now: number) => GameState;
  createRngSeed: () => number;
  nextNotificationId: (now: number) => string;
}

