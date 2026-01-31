import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store';
import { TICK_RATE_MS } from '@/game/data';

/**
 * Manages the game tick loop.
 * Runs at TICK_RATE_MS intervals and calls the store's tick action.
 */
export function TickManager() {
  const tick = useGameStore((state) => state.tick);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;

      tick(deltaMs);
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [tick]);

  return null;
}
