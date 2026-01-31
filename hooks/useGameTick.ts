import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store';
import { TICK_RATE_MS } from '@/game/data';
import type { GameState } from '@/game/types';

/**
 * Hook to manage the game tick loop.
 * Note: The main tick loop is in TickManager.
 * This hook is for components that need tick-synchronized updates.
 */
export function useGameTick(onTick?: (deltaMs: number) => void) {
  const state = useGameStore((s) => ({
    player: s.player,
    skills: s.skills,
    resources: s.resources,
    timestamps: s.timestamps,
    activeSkill: s.activeSkill,
    rngSeed: s.rngSeed,
  })) as GameState;

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
  const sessionStart = useGameStore((s) => s.timestamps.sessionStart);
  const now = Date.now();
  return now - sessionStart;
}
