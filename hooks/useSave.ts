import { useCallback } from 'react';
import { useGameStore, useIsHydrated } from '@/store';
import { stateToJson, jsonToState } from '@/game/save';
import { storage, clearStorageSync } from '@/services/mmkv-storage';
import { getCurrentGameState } from '@/store/gameStore';

const MANUAL_SAVE_KEY = 'manual-save';

/**
 * Hook to manage save/load operations.
 * Auto-save is handled automatically by Zustand persist middleware.
 */
export function useSave() {
  const loadSave = useGameStore((s) => s.loadSave);
  const resetStore = useGameStore((s) => s.reset);
  const isLoaded = useIsHydrated();

  const save = useCallback(() => {
    try {
      const json = stateToJson(getCurrentGameState());
      storage.set(MANUAL_SAVE_KEY, json);
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  }, []);

  const load = useCallback(() => {
    try {
      const json = storage.getString(MANUAL_SAVE_KEY);
      if (json) {
        const result = jsonToState(json, { now: Date.now() });
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
