import type { GameState } from '../types';
import type { SaveBlob } from './schema';
import { CURRENT_SAVE_VERSION } from './schema';

/**
 * Serialize game state to a save blob.
 */
export function serializeState(state: GameState): SaveBlob {
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: Date.now(),
    state: {
      ...state,
      timestamps: {
        ...state.timestamps,
        lastSave: Date.now(),
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
