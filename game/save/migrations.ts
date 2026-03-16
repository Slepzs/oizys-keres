import type { SaveBlob } from './schema';
import { CURRENT_SAVE_VERSION } from './schema';
import { createInitialBagState } from '../data/items.data';
import { createInitialQuestsState } from '../data/quests.data';
import { createInitialAchievementsState } from '../data/achievements.data';
import { createInitialCraftingState } from '../data/crafting.data';
import { createInitialSummoningState } from '../data/summoning.data';
import { playerMaxHealthForLevel, playerMaxManaForLevel } from '../data/curves';
import { createInitialMultipliersState } from '../logic/multipliers';
import { createInitialCombatState } from '../logic/combat';
import type { RockTierId, TreeTierId } from '../types';

type MigrationFn = (save: SaveBlob) => SaveBlob;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function migratePlayerVitals(save: SaveBlob, targetVersion: number): SaveBlob {
  const level = Math.max(1, Math.floor(save.state.player.level ?? 1));
  const maxHealth = playerMaxHealthForLevel(level);
  const maxMana = playerMaxManaForLevel(level);

  const currentHealth = Number.isFinite((save.state.player as any)?.health)
    ? (save.state.player as any).health
    : maxHealth;
  const currentMana = Number.isFinite((save.state.player as any)?.mana)
    ? (save.state.player as any).mana
    : maxMana;

  return {
    ...save,
    version: targetVersion,
    state: {
      ...save.state,
      player: {
        ...save.state.player,
        health: clamp(currentHealth, 0, maxHealth),
        maxHealth,
        mana: clamp(currentMana, 0, maxMana),
        maxMana,
      },
    },
  };
}

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
        activeTabIndex: 0,
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
  // Migration from v5 to v6: Add combat system
  5: (save) => ({
    ...save,
    version: 6,
    state: {
      ...save.state,
      combat: createInitialCombatState(),
    },
  }),
  // Migration from v6 to v7: Initialize activeTreeId for woodcutting
  6: (save) => {
    // Set to highest available tree based on level (default behavior)
    const woodcuttingLevel = save.state.skills.woodcutting.level;
    const treeTiers = [
      { id: 'normal', level: 1 },
      { id: 'oak', level: 15 },
      { id: 'willow', level: 30 },
      { id: 'maple', level: 45 },
      { id: 'yew', level: 60 },
      { id: 'magic', level: 75 },
    ] satisfies Array<{ id: TreeTierId; level: number }>;
    const availableTrees = treeTiers.filter(tree => tree.level <= woodcuttingLevel);
    const defaultTree = availableTrees[availableTrees.length - 1];

    return {
      ...save,
      version: 7,
      state: {
        ...save.state,
        skills: {
          ...save.state.skills,
          woodcutting: {
            ...save.state.skills.woodcutting,
            activeTreeId: defaultTree?.id || 'normal',
          },
        },
      },
    };
  },

  // Migration from v7 to v8: Add player coins + per-zone enemy selection
  7: (save) => ({
    ...save,
    version: 8,
    state: {
      ...save.state,
      player: {
        ...save.state.player,
        coins: (save.state.player as any)?.coins ?? 0,
      },
      combat: {
        ...save.state.combat,
        selectedEnemyByZone: (save.state.combat as any)?.selectedEnemyByZone ?? {},
      },
    },
  }),

  // Migration from v8 to v9: Add bag tab state
  8: (save) => ({
    ...save,
    version: 9,
    state: {
      ...save.state,
      bagSettings: {
        ...save.state.bagSettings,
        activeTabIndex: (save.state.bagSettings as any)?.activeTabIndex ?? 0,
      },
    },
  }),

  // Migration from v9 to v10: Add crafting progression state
  9: (save) => ({
    ...save,
    version: 10,
    state: {
      ...save.state,
      crafting: createInitialCraftingState(),
    },
  }),

  // Migration from v10 to v11: Add player health/mana vitals
  10: (save) => migratePlayerVitals(save, 11),

  // Migration from v11 to v12: Rename smithing -> crafting and add crafting automation state
  11: (save) => {
    const rawSkills = (save.state.skills as any) ?? {};
    const { smithing: legacySmithing, ...skillsWithoutLegacy } = rawSkills;
    const mergedCraftingSkill = {
      ...(skillsWithoutLegacy.crafting ?? {}),
      ...(legacySmithing ?? {}),
    };

    mergedCraftingSkill.automationUnlocked = true;

    const rawSkillStats = (save.state.skillStats as any) ?? {};
    const { smithing: legacySmithingStats, ...skillStatsWithoutLegacy } = rawSkillStats;
    const mergedCraftingStats = {
      ...(skillStatsWithoutLegacy.crafting ?? {}),
      ...(legacySmithingStats ?? {}),
    };

    const baseCrafting = createInitialCraftingState();
    const rawCrafting = (save.state as any).crafting ?? {};
    const rawAutomation = rawCrafting.automation ?? {};

    return {
      ...save,
      version: 12,
      state: {
        ...save.state,
        skills: {
          ...skillsWithoutLegacy,
          crafting: mergedCraftingSkill,
        },
        skillStats: {
          ...skillStatsWithoutLegacy,
          crafting: mergedCraftingStats,
        },
        multipliers: {
          ...(save.state.multipliers ?? createInitialMultipliersState()),
          active: ((save.state.multipliers?.active ?? []) as Array<any>).map((multiplier) => (
            multiplier.target === 'smithing'
              ? { ...multiplier, target: 'crafting' }
              : multiplier
          )),
        },
        activeSkill: save.state.activeSkill === 'smithing' ? null : save.state.activeSkill,
        crafting: {
          ...baseCrafting,
          ...rawCrafting,
          infrastructureLevels: {
            ...baseCrafting.infrastructureLevels,
            ...(rawCrafting.infrastructureLevels ?? {}),
          },
          automation: {
            ...baseCrafting.automation,
            ...rawAutomation,
            recipeId: typeof rawAutomation.recipeId === 'string' ? rawAutomation.recipeId : null,
            quantity: Math.max(1, Math.floor(rawAutomation.quantity ?? baseCrafting.automation.quantity)),
            tickProgress: Math.max(0, Number(rawAutomation.tickProgress ?? baseCrafting.automation.tickProgress)),
          },
        },
      },
    };
  },

  // Migration from v12 to v13: Ensure player health/mana vitals for all modern saves
  12: (save) => migratePlayerVitals(save, 13),

  // Migration from v13 to v14: Initialize activeRockId for mining skill
  13: (save) => {
    const miningLevel = save.state.skills.mining?.level ?? 1;
    // Default to highest available rock tier based on current mining level
    const rockTiers = [
      { id: 'limestone', level: 1 },
      { id: 'copper', level: 10 },
      { id: 'iron', level: 25 },
      { id: 'coal', level: 40 },
      { id: 'mithril', level: 55 },
      { id: 'adamantite', level: 70 },
    ] satisfies Array<{ id: RockTierId; level: number }>;
    const availableRocks = rockTiers.filter(rock => rock.level <= miningLevel);
    const defaultRock = availableRocks[availableRocks.length - 1];

    return {
      ...save,
      version: 14,
      state: {
        ...save.state,
        skills: {
          ...save.state.skills,
          mining: {
            ...save.state.skills.mining,
            activeRockId: defaultRock?.id || 'limestone',
          },
        },
        resources: {
          ...save.state.resources,
          copper_ore: (save.state.resources as any)?.copper_ore ?? { amount: 0, totalGained: 0 },
          iron_ore: (save.state.resources as any)?.iron_ore ?? { amount: 0, totalGained: 0 },
          coal: (save.state.resources as any)?.coal ?? { amount: 0, totalGained: 0 },
          mithril_ore: (save.state.resources as any)?.mithril_ore ?? { amount: 0, totalGained: 0 },
          adamantite_ore: (save.state.resources as any)?.adamantite_ore ?? { amount: 0, totalGained: 0 },
        },
      },
    };
  },

  // Migration from v14 to v15: Add summoning skill, spirit essence, and companion state
  14: (save) => ({
    ...save,
    version: 15,
    state: {
      ...save.state,
      skills: {
        ...save.state.skills,
        summoning: {
          level: 1,
          xp: 0,
          automationUnlocked: false,
          automationEnabled: false,
          tickProgress: 0,
        },
      },
      skillStats: {
        ...(save.state.skillStats as any),
        summoning: {
          level: 1,
          xp: 0,
        },
      },
      resources: {
        ...save.state.resources,
        spirit_essence: (save.state.resources as any)?.spirit_essence ?? { amount: 0, totalGained: 0 },
      },
      summoning: createInitialSummoningState(),
    },
  }),

  // Migration from v15 to v16: Add fishing skill and fish resources
  15: (save) => ({
    ...save,
    version: 16,
    state: {
      ...save.state,
      skills: {
        ...save.state.skills,
        fishing: {
          level: 1,
          xp: 0,
          automationUnlocked: false,
          automationEnabled: false,
          tickProgress: 0,
        },
      },
      skillStats: {
        ...(save.state.skillStats as any),
        fishing: {
          level: 1,
          xp: 0,
        },
      },
      resources: {
        ...save.state.resources,
        raw_shrimp: { amount: 0, totalGained: 0 },
        raw_sardine: { amount: 0, totalGained: 0 },
        raw_trout: { amount: 0, totalGained: 0 },
        raw_salmon: { amount: 0, totalGained: 0 },
        raw_lobster: { amount: 0, totalGained: 0 },
        raw_swordfish: { amount: 0, totalGained: 0 },
        raw_shark: { amount: 0, totalGained: 0 },
      },
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
