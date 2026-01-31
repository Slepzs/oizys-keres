import { useEffect, useRef } from 'react';
import { useGame } from './useGame';
import { TICK_RATE_MS } from '@/game/data';

/**
 * Hook to manage the game tick loop.
 * Note: The main tick loop is in GameProvider.
 * This hook is for components that need tick-synchronized updates.
 */
export function useGameTick(onTick?: (deltaMs: number) => void) {
  const { state } = useGame();
  const lastTickRef = useRef(Date.now());
  const callbackRef = useRef(onTick);

  // Update callback ref without re-creating effect
  callbackRef.current = onTick;

  useEffect(() => {
    if (!callbackRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;

      callbackRef.current?.(deltaMs);
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  return state;
}

/**
 * Get elapsed time since session start.
 */
export function useSessionTime() {
  const { state } = useGame();
  const now = Date.now();
  return now - state.timestamps.sessionStart;
}
