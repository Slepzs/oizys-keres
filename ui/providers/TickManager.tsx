import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useGameStore } from '@/store';
import { TICK_RATE_MS } from '@/game/data';

/**
 * Manages the game tick loop.
 * Runs at TICK_RATE_MS intervals and calls the store's tick action.
 */
export function TickManager() {
  const tick = useGameStore((state) => state.tick);
  const applyOfflineProgress = useGameStore((state) => state.applyOfflineProgress);
  const flushSave = useGameStore((state) => state.flushSave);
  const lastTickRef = useRef(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;

      tick(deltaMs, now);
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    function handleAppStateChange(nextAppState: AppStateStatus) {
      const prev = appStateRef.current;
      appStateRef.current = nextAppState;

      if (prev === 'active' && nextAppState !== 'active') {
        flushSave(Date.now());
        return;
      }

      if (prev !== 'active' && nextAppState === 'active') {
        const now = Date.now();
        lastTickRef.current = now;
        applyOfflineProgress(now);
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [applyOfflineProgress, flushSave]);

  return null;
}
