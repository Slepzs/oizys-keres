import type { GameContext, GameState } from '../types';
import type { GameEvent } from '../systems/events.types';
import { TICKS_PER_SECOND } from '../data/constants';
import { advanceSeed } from './rng';
import { processCombatTick } from './combat/tick';
import { processCraftingAutomationTick } from './crafting';
import { regeneratePlayerVitals } from './player';
import { processSkillsTick } from './skills/tick';

export interface TickResult {
  state: GameState;
  events: GameEvent[];
}

/**
 * @deprecated Use GameEvent from '../systems/events.types' instead
 */
export type TickEvent = GameEvent;

/**
 * Process a single game tick.
 * This is the core game loop function - pure and deterministic.
 */
export function processTick(state: GameState, deltaMs: number, ctx: GameContext): TickResult {
  let newState = { ...state };

  // Calculate ticks elapsed (fractional)
  const ticksElapsed = (deltaMs / 1000) * TICKS_PER_SECOND;

  const skillsResult = processSkillsTick(newState, ticksElapsed);
  newState = skillsResult.state;
  const events: GameEvent[] = [...skillsResult.events];

  const craftingResult = processCraftingAutomationTick(newState, ticksElapsed);
  newState = craftingResult.state;
  events.push(...craftingResult.events);

  // Process combat if active
  if (newState.combat.activeCombat) {
    const combatResult = processCombatTick(newState.combat, ctx.now, ticksElapsed);
    newState = { ...newState, combat: combatResult.state };
    events.push(...combatResult.events);
  }

  // Regenerate player health and mana every tick (applies to offline processing too).
  newState = {
    ...newState,
    player: regeneratePlayerVitals(newState.player, deltaMs),
  };

  // Advance RNG seed
  newState.rngSeed = advanceSeed(newState.rngSeed);

  return { state: newState, events };
}

/**
 * Process multiple ticks at once (for offline progress).
 */
export function processMultipleTicks(
  state: GameState,
  totalMs: number,
  startNow: number,
  chunkMs: number = 1000
): TickResult {
  let currentState = state;
  const allEvents: GameEvent[] = [];

  let remainingMs = totalMs;
  let elapsedMs = 0;

  while (remainingMs > 0) {
    const chunkDuration = Math.min(remainingMs, chunkMs);
    elapsedMs += chunkDuration;
    const result = processTick(currentState, chunkDuration, { now: startNow + elapsedMs });
    currentState = result.state;
    allEvents.push(...result.events);
    remainingMs -= chunkDuration;
  }

  return { state: currentState, events: allEvents };
}
