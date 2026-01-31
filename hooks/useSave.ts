import { useCallback } from 'react';
import { useGameStore, useIsHydrated } from '@/store';
import { stateToJson, jsonToState } from '@/game/save';
import { storage, clearStorageSync } from '@/services/mmkv-storage';
import type { GameState } from '@/game/types';

const MANUAL_SAVE_KEY = 'manual-save';

/**
 * Hook to manage save/load operations.
 * Auto-save is handled automatically by Zustand persist middleware.
 */
export function useSave() {
  const state = useGameStore((s) => ({
    player: s.player,
    skills: s.skills,
    resources: s.resources,
    timestamps: s.timestamps,
    activeSkill: s.activeSkill,
    rngSeed: s.rngSeed,
  })) as GameState;

  const loadSave = useGameStore((s) => s.loadSave);
  const resetStore = useGameStore((s) => s.reset);
  const isLoaded = useIsHydrated();

  const save = useCallback(() => {
    try {
      const json = stateToJson(state);
      storage.set(MANUAL_SAVE_KEY, json);
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  }, [state]);

  const load = useCallback(() => {
    try {
      const json = storage.getString(MANUAL_SAVE_KEY);
      if (json) {
        const result = jsonToState(json);
        if (result.success) {
          loadSave(result.state);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Manual load failed:', error);
      return false;
    }
  }, [loadSave]);

  const reset = useCallback(() => {
    clearStorageSync();
    resetStore();
  }, [resetStore]);

  return { save, load, reset, isLoaded };
}
