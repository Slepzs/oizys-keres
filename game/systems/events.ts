import type { GameState } from '../types';
import type { GameContext } from '../types/context';
import type { GameEvent, EventHandler, EventHandlerResult } from './events.types';

interface Listener {
  type: GameEvent['type'];
  handler: (event: GameEvent, state: GameState, ctx: GameContext) => EventHandlerResult;
  priority: number;
}

/**
 * Event bus for decoupling event producers (tick system) from consumers
 * (quests, achievements, stats tracking, etc.)
 *
 * Listeners are sorted by priority (lower = runs first) to ensure
 * deterministic processing order.
 */
class EventBus {
  private listeners: Listener[] = [];

  /**
   * Register a handler for a specific event type.
   * @param type - The event type to listen for
   * @param handler - The handler function that receives the event and returns new state
   * @param priority - Lower values run first (default: 100)
   * @returns Unsubscribe function
   */
  on<T extends GameEvent['type']>(
    type: T,
    handler: EventHandler<T>,
    priority = 100
  ): () => void {
    const listener: Listener = {
      type,
      handler: handler as (event: GameEvent, state: GameState, ctx: GameContext) => EventHandlerResult,
      priority,
    };
    this.listeners.push(listener);
    this.listeners.sort((a, b) => a.priority - b.priority);
    return () => this.off(listener);
  }

  /**
   * Remove a listener.
   */
  off(listener: Listener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Dispatch events to all registered listeners.
   * Events are processed in order, with each listener receiving the
   * state as modified by previous listeners.
   *
   * @param events - Array of events to dispatch
   * @param state - Current game state
   * @returns Updated game state after all listeners have processed
   */
  dispatch(events: GameEvent[], state: GameState, ctx: GameContext): GameState {
    let currentState = state;
    const queue: GameEvent[] = [...events];

    for (let index = 0; index < queue.length; index += 1) {
      const event = queue[index];
      for (const listener of this.listeners) {
        if (listener.type === event.type) {
          const result = listener.handler(event, currentState, ctx);
          if (isHandlerResult(result)) {
            currentState = result.state;
            if (result.events && result.events.length > 0) {
              queue.push(...result.events);
            }
          } else {
            currentState = result;
          }
        }
      }
    }

    return currentState;
  }

  /**
   * Check if there are any listeners registered for a specific event type.
   */
  hasListeners(type: GameEvent['type']): boolean {
    return this.listeners.some((l) => l.type === type);
  }

  /**
   * Clear all listeners. Useful for testing.
   */
  clear(): void {
    this.listeners = [];
  }
}

/**
 * Singleton event bus instance for the game.
 */
export const eventBus = new EventBus();

function isHandlerResult(result: EventHandlerResult): result is { state: GameState; events?: GameEvent[] } {
  return typeof result === 'object' && result !== null && 'state' in result;
}

const registrationKeys = new Set<string>();

export function registerOnce(key: string, register: () => void): void {
  if (registrationKeys.has(key)) {
    return;
  }
  registrationKeys.add(key);
  register();
}
