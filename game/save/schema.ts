import type { GameState } from '../types';

export const CURRENT_SAVE_VERSION = 10;

export interface SaveBlob {
  version: number;
  savedAt: number;
  state: GameState;
}

export interface SaveMetadata {
  version: number;
  savedAt: number;
  playerLevel: number;
  playTime: number;
}
