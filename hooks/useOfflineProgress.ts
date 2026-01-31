import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGameStore } from '@/store';
import {
  processOfflineProgress,
  summarizeOfflineProgress,
  OfflineProgressSummary,
} from '@/game/logic';
import type { GameState } from '@/game/types';

/**
 * Hook to handle offline progress when app comes back to foreground.
 */
export function useOfflineProgress() {
  const state = useGameStore((s) => ({
    player: s.player,
    skills: s.skills,
    resources: s.resources,
    timestamps: s.timestamps,
    activeSkill: s.activeSkill,
    rngSeed: s.rngSeed,
  })) as GameState;

  const loadSave = useGameStore((s) => s.loadSave);

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

        loadSave(result.state);
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [state, loadSave]);

  const dismissSummary = () => {
    setShowSummary(false);
  };

  return {
    lastSummary,
    showSummary,
    dismissSummary,
  };
}
