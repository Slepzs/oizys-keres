import type { GameState } from '../types';
import type { SaveBlob } from './schema';
import { CURRENT_SAVE_VERSION } from './schema';

export interface SerializeOptions {
  now?: number;
}

/**
 * Serialize game state to a save blob.
 */
export function serializeState(state: GameState, options: SerializeOptions = {}): SaveBlob {
  const now = options.now ?? Date.now();
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: now,
    state: {
      ...state,
      timestamps: {
        ...state.timestamps,
        lastSave: now,
      },
    },
  };
}

/**
 * Convert save blob to JSON string.
 */
export function saveToJson(save: SaveBlob): string {
  return JSON.stringify(save);
}

/**
 * Convenience function to serialize state directly to JSON.
 */
export function stateToJson(state: GameState): string {
  return saveToJson(serializeState(state));
}
