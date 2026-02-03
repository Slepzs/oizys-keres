import type { GameState } from '../types';
import { DEFAULT_BAG_SIZE } from '../data/items.data';
import type { SaveBlob } from './schema';
import { migrateSave, needsMigration } from './migrations';
import { createInitialGameState, createInitialNotificationsState } from './initial-state';

export interface DeserializeResult {
  success: boolean;
  state: GameState;
  wasMigrated: boolean;
  error?: string;
}

export interface DeserializeOptions {
  now?: number;
}

function normalizeBag(bag: GameState['bag']): GameState['bag'] {
  const slots = Array.isArray(bag.slots) ? [...bag.slots] : [];
  const maxSlots = Math.max(DEFAULT_BAG_SIZE, bag.maxSlots ?? 0, slots.length);

  if (slots.length > maxSlots) {
    slots.length = maxSlots;
  } else {
    while (slots.length < maxSlots) {
      slots.push(null);
    }
  }

  return { ...bag, maxSlots, slots };
}

/**
 * Parse JSON string to save blob.
 */
export function jsonToSave(json: string): SaveBlob | null {
  try {
    const parsed = JSON.parse(json);

    // Basic validation
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    if (typeof parsed.version !== 'number') {
      return null;
    }

    if (!parsed.state || typeof parsed.state !== 'object') {
      return null;
    }

    return parsed as SaveBlob;
  } catch {
    return null;
  }
}

/**
 * Deserialize a save blob to game state.
 * Handles migrations and validation.
 */
export function deserializeSave(save: SaveBlob, options: DeserializeOptions = {}): DeserializeResult {
  try {
    let processedSave = save;
    let wasMigrated = false;

    // Apply migrations if needed
    if (needsMigration(save)) {
      processedSave = migrateSave(save);
      wasMigrated = true;
    }

    // Validate state structure
    const state = repairGameState(processedSave.state, options);

    return {
      success: true,
      state,
      wasMigrated,
    };
  } catch (error) {
    return {
      success: false,
      state: createInitialGameState({ now: options.now }),
      wasMigrated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convenience function to deserialize directly from JSON.
 */
export function jsonToState(json: string, options: DeserializeOptions = {}): DeserializeResult {
  const save = jsonToSave(json);

  if (!save) {
    return {
      success: false,
      state: createInitialGameState({ now: options.now }),
      wasMigrated: false,
      error: 'Invalid JSON or save format',
    };
  }

  return deserializeSave(save, options);
}

/**
 * Validate state and repair any missing fields with defaults.
 */
export function repairGameState(state: Partial<GameState>, options: DeserializeOptions = {}): GameState {
  const now = options.now ?? Date.now();
  const initial = createInitialGameState({
    now,
    rngSeed: state.rngSeed ?? ((now & 0x7fffffff) || 1),
  });

  return {
    player: {
      level: state.player?.level ?? initial.player.level,
      xp: state.player?.xp ?? initial.player.xp,
      coins: (state.player as any)?.coins ?? initial.player.coins,
    },
    skills: {
      ...initial.skills,
      ...state.skills,
    },
    attributes: {
      ...initial.attributes,
      ...state.attributes,
    },
    skillStats: {
      ...initial.skillStats,
      ...state.skillStats,
    },
    resources: {
      ...initial.resources,
      ...state.resources,
    },
    bag: normalizeBag(state.bag ?? initial.bag),
    combat: {
      ...initial.combat,
      ...(state.combat ?? {}),
      combatSkills: {
        ...initial.combat.combatSkills,
        ...(state.combat?.combatSkills ?? {}),
      },
      equipment: {
        ...initial.combat.equipment,
        ...(state.combat?.equipment ?? {}),
      },
      selectedEnemyByZone: (state.combat as any)?.selectedEnemyByZone ?? initial.combat.selectedEnemyByZone,
    },
    bagSettings: {
      autoSort: state.bagSettings?.autoSort ?? initial.bagSettings.autoSort,
      sortMode: state.bagSettings?.sortMode ?? initial.bagSettings.sortMode,
    },
    quests: state.quests ?? initial.quests,
    achievements: state.achievements ?? initial.achievements,
    multipliers: state.multipliers ?? initial.multipliers,
    timestamps: {
      lastActive: state.timestamps?.lastActive ?? initial.timestamps.lastActive,
      lastSave: state.timestamps?.lastSave ?? initial.timestamps.lastSave,
      sessionStart: now, // Always reset session start
    },
    activeSkill: state.activeSkill ?? null,
    rngSeed: state.rngSeed ?? initial.rngSeed,
    // Notifications are transient UI state - always reset to empty on load
    notifications: createInitialNotificationsState(),
  };
}
