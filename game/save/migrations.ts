import type { SaveBlob } from './schema';
import { CURRENT_SAVE_VERSION } from './schema';
import { createInitialBagState } from '../data/items.data';
import { createInitialQuestsState } from '../data/quests.data';
import { createInitialAchievementsState } from '../data/achievements.data';
import { createInitialMultipliersState } from '../logic/multipliers';

type MigrationFn = (save: SaveBlob) => SaveBlob;

/**
 * Registry of migration functions.
 * Key is the version we're migrating FROM.
 */
const migrations: Record<number, MigrationFn> = {
  // Migration from v1 to v2: Add bag system
  1: (save) => ({
    ...save,
    version: 2,
    state: {
      ...save.state,
      bag: createInitialBagState(),
    },
  }),
  // Migration from v2 to v3: Add quest system
  2: (save) => ({
    ...save,
    version: 3,
    state: {
      ...save.state,
      quests: createInitialQuestsState(),
    },
  }),
  // Migration from v3 to v4: Add bag settings
  3: (save) => ({
    ...save,
    version: 4,
    state: {
      ...save.state,
      bagSettings: {
        autoSort: false,
        sortMode: 'rarity' as const,
      },
    },
  }),
  // Migration from v4 to v5: Add achievements and multipliers
  4: (save) => ({
    ...save,
    version: 5,
    state: {
      ...save.state,
      achievements: createInitialAchievementsState(),
      multipliers: createInitialMultipliersState(),
    },
  }),
};

/**
 * Migrate a save blob to the current version.
 */
export function migrateSave(save: SaveBlob): SaveBlob {
  let current = save;

  while (current.version < CURRENT_SAVE_VERSION) {
    const migration = migrations[current.version];

    if (!migration) {
      console.warn(`No migration found for version ${current.version}`);
      // Force version update to prevent infinite loop
      current = { ...current, version: current.version + 1 };
    } else {
      current = migration(current);
    }
  }

  return current;
}

/**
 * Check if a save needs migration.
 */
export function needsMigration(save: SaveBlob): boolean {
  return save.version < CURRENT_SAVE_VERSION;
}
