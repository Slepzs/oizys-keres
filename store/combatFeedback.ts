import type { GameEvent } from '../game/systems/events.types';
import type { ItemId } from '../game/types';

export interface CombatLogEntry {
  id: string;
  at: number;
  text: string;
}

export interface CombatFeedbackState {
  entries: CombatLogEntry[];
  killsThisSession: number;
  sessionStartedAt: number | null;
}

const MAX_COMBAT_LOG_ENTRIES = 12;

interface CombatFeedbackResolvers {
  getEnemyName?: (enemyId: string) => string | null | undefined;
  getItemName?: (itemId: ItemId) => string | null | undefined;
}

export function createInitialCombatFeedback(now: number | null = null): CombatFeedbackState {
  return {
    entries: [],
    killsThisSession: 0,
    sessionStartedAt: now,
  };
}

function getEnemyName(
  enemyId: string | null | undefined,
  resolvers?: CombatFeedbackResolvers
): string | null {
  if (!enemyId) {
    return null;
  }

  return resolvers?.getEnemyName?.(enemyId) ?? null;
}

function getItemName(itemId: ItemId, resolvers?: CombatFeedbackResolvers): string {
  return resolvers?.getItemName?.(itemId) ?? itemId;
}

function formatEventText(
  event: GameEvent,
  currentEnemyName: string | null,
  resolvers?: CombatFeedbackResolvers
): string | null {
  switch (event.type) {
    case 'COMBAT_PLAYER_ATTACK':
      if (event.isCritical) {
        return currentEnemyName
          ? `Crit! You hit ${currentEnemyName} for ${event.damage}`
          : `Crit! You hit for ${event.damage}`;
      }

      return currentEnemyName
        ? `You hit ${currentEnemyName} for ${event.damage}`
        : `You hit for ${event.damage}`;

    case 'COMBAT_ENEMY_ATTACK':
      return currentEnemyName
        ? `${currentEnemyName} hits you for ${event.damage}`
        : `Enemy hits you for ${event.damage}`;

    case 'COMBAT_PLAYER_REGEN':
      return `Regen +${event.hpRestored} HP`;

    case 'COMBAT_PET_ATTACK':
      if (currentEnemyName) {
        return event.healAmount > 0
          ? `Pet hits ${currentEnemyName} for ${event.damage} and heals ${event.healAmount}`
          : `Pet hits ${currentEnemyName} for ${event.damage}`;
      }

      return event.healAmount > 0
        ? `Pet hits for ${event.damage} and heals ${event.healAmount}`
        : `Pet hits for ${event.damage}`;

    case 'COMBAT_ENEMY_KILLED':
      return `Killed ${getEnemyName(event.enemyId, resolvers) ?? event.enemyId}`;

    case 'COMBAT_ITEM_DROPPED':
      return `Loot: ${getItemName(event.itemId, resolvers)} x${event.quantity}`;

    default:
      return null;
  }
}

export function applyCombatFeedbackEvents(
  combatFeedback: CombatFeedbackState,
  events: GameEvent[],
  now: number,
  activeEnemyId?: string | null,
  resolvers?: CombatFeedbackResolvers
): CombatFeedbackState {
  let currentEnemyId = activeEnemyId ?? null;
  const newEntries: CombatLogEntry[] = [];
  let killsThisSession = combatFeedback.killsThisSession;

  for (const event of events) {
    if (event.type === 'COMBAT_STARTED') {
      currentEnemyId = event.enemyId;
      continue;
    }

    if (event.type === 'COMBAT_ENEMY_KILLED') {
      currentEnemyId = event.enemyId;
      killsThisSession += 1;
    }

    if (event.type === 'COMBAT_ITEM_DROPPED') {
      currentEnemyId = event.enemyId;
    }

    const text = formatEventText(event, getEnemyName(currentEnemyId, resolvers), resolvers);
    if (!text) {
      continue;
    }

    newEntries.push({
      id: `${now}-${newEntries.length}-${text}`,
      at: now,
      text,
    });
  }

  if (newEntries.length === 0 && killsThisSession === combatFeedback.killsThisSession) {
    return combatFeedback;
  }

  return {
    ...combatFeedback,
    sessionStartedAt: combatFeedback.sessionStartedAt ?? now,
    killsThisSession,
    entries: [...newEntries.reverse(), ...combatFeedback.entries].slice(0, MAX_COMBAT_LOG_ENTRIES),
  };
}
