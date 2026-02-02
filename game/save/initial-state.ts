import type { GameState, BagSettings } from '../types';
import { createInitialSkillsState } from '../data/skills.data';
import { createInitialResourcesState } from '../data/resources.data';
import { createInitialBagState } from '../data/items.data';
import { createInitialQuestsState } from '../data/quests.data';
import {
  createInitialAttributesState,
  createInitialSkillStatsState,
} from '../data/stats.data';

export function createInitialBagSettings(): BagSettings {
  return {
    autoSort: false,
    sortMode: 'rarity',
  };
}

/**
 * Create a fresh game state for new players.
 */
export function createInitialGameState(): GameState {
  const now = Date.now();

  return {
    player: {
      level: 1,
      xp: 0,
    },
    skills: createInitialSkillsState(),
    attributes: createInitialAttributesState(),
    skillStats: createInitialSkillStatsState(),
    resources: createInitialResourcesState(),
    bag: createInitialBagState(),
    bagSettings: createInitialBagSettings(),
    quests: createInitialQuestsState(),
    timestamps: {
      lastActive: now,
      lastSave: now,
      sessionStart: now,
    },
    activeSkill: null,
    rngSeed: Math.floor(Math.random() * 2147483647),
  };
}
