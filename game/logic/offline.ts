import type { GameState } from '../types';
import { MAX_OFFLINE_MS } from '../data/constants';
import { processMultipleTicks, TickResult } from './tick';

export interface OfflineProgressResult extends TickResult {
  elapsedMs: number;
  cappedMs: number;
  wasCapped: boolean;
}

/**
 * Calculate and apply offline progress.
 * Called when the app resumes after being backgrounded.
 */
export function processOfflineProgress(
  state: GameState,
  now: number
): OfflineProgressResult {
  const startNow = state.timestamps.lastActive;
  const elapsedMs = now - startNow;

  if (elapsedMs <= 0) {
    return {
      state,
      events: [],
      elapsedMs: 0,
      cappedMs: 0,
      wasCapped: false,
    };
  }

  // Cap offline progress
  const cappedMs = Math.min(elapsedMs, MAX_OFFLINE_MS);
  const wasCapped = elapsedMs > MAX_OFFLINE_MS;

  // Process ticks with larger chunks for efficiency
  // Use 10-second chunks for offline to reduce computation
  const result = processMultipleTicks(state, cappedMs, startNow, 10_000);

  // Update timestamps
  const newState: GameState = {
    ...result.state,
    timestamps: {
      ...result.state.timestamps,
      lastActive: now,
    },
  };

  return {
    state: newState,
    events: result.events,
    elapsedMs,
    cappedMs,
    wasCapped,
  };
}

/**
 * Summarize offline progress for display to player.
 */
export function summarizeOfflineProgress(result: OfflineProgressResult): OfflineProgressSummary {
  const skillXpGained: Record<string, number> = {};
  const resourcesGained: Record<string, number> = {};
  const levelsGained: Record<string, number> = {};

  for (const event of result.events) {
    switch (event.type) {
      case 'SKILL_ACTION':
        skillXpGained[event.skillId] = (skillXpGained[event.skillId] || 0) + event.xpGained;
        break;
      case 'SKILL_LEVEL_UP':
        levelsGained[event.skillId] = (levelsGained[event.skillId] || 0) + 1;
        break;
    }
  }

  return {
    elapsedMs: result.elapsedMs,
    cappedMs: result.cappedMs,
    wasCapped: result.wasCapped,
    skillXpGained,
    resourcesGained,
    levelsGained,
    totalEvents: result.events.length,
  };
}

export interface OfflineProgressSummary {
  elapsedMs: number;
  cappedMs: number;
  wasCapped: boolean;
  skillXpGained: Record<string, number>;
  resourcesGained: Record<string, number>;
  levelsGained: Record<string, number>;
  totalEvents: number;
}
