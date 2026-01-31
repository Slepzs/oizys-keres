import { useCallback, useEffect, useRef } from 'react';
import { useGame } from './useGame';
import { stateToJson, jsonToState } from '@/game/save';
import { saveToStorage, loadFromStorage } from '@/services/storage';
import { AUTO_SAVE_INTERVAL_MS } from '@/game/data';
import { processOfflineProgress } from '@/game/logic';

/**
 * Hook to manage save/load operations.
 */
export function useSave() {
  const { state, dispatch, isLoaded } = useGame();
  const hasLoadedRef = useRef(false);

  // Load save on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function loadSave() {
      try {
        const json = await loadFromStorage();
        if (json) {
          const result = jsonToState(json);
          if (result.success) {
            // Process offline progress
            const offlineResult = processOfflineProgress(result.state, Date.now());
            dispatch({ type: 'LOAD_SAVE', payload: { state: offlineResult.state } });

            if (offlineResult.elapsedMs > 60_000) {
              // Could show offline progress modal here
              console.log(`Processed ${Math.floor(offlineResult.elapsedMs / 1000)}s of offline progress`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load save:', error);
      }
    }

    loadSave();
  }, [dispatch]);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      try {
        const json = stateToJson(state);
        await saveToStorage(json);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state, isLoaded]);

  const save = useCallback(async () => {
    try {
      const json = stateToJson(state);
      await saveToStorage(json);
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  }, [state]);

  const load = useCallback(async () => {
    try {
      const json = await loadFromStorage();
      if (json) {
        const result = jsonToState(json);
        if (result.success) {
          dispatch({ type: 'LOAD_SAVE', payload: { state: result.state } });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Manual load failed:', error);
      return false;
    }
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return { save, load, reset };
}
