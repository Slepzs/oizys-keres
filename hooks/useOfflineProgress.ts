import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGame } from './useGame';
import { processOfflineProgress, summarizeOfflineProgress, OfflineProgressSummary } from '@/game/logic';

/**
 * Hook to handle offline progress when app comes back to foreground.
 */
export function useOfflineProgress() {
  const { state, dispatch } = useGame();
  const [lastSummary, setLastSummary] = useState<OfflineProgressSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    function handleAppStateChange(nextAppState: AppStateStatus) {
      if (nextAppState === 'active') {
        // App came to foreground
        const now = Date.now();
        const result = processOfflineProgress(state, now);

        // Only show summary for significant offline time (> 1 minute)
        if (result.elapsedMs > 60_000) {
          const summary = summarizeOfflineProgress(result);
          setLastSummary(summary);
          setShowSummary(true);
        }

        dispatch({ type: 'LOAD_SAVE', payload: { state: result.state } });
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [state, dispatch]);

  const dismissSummary = () => {
    setShowSummary(false);
  };

  return {
    lastSummary,
    showSummary,
    dismissSummary,
  };
}
