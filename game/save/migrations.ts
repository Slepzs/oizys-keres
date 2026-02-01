import type { SaveBlob } from './schema';
import { CURRENT_SAVE_VERSION } from './schema';
import { createInitialBagState } from '../data/items.data';

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
