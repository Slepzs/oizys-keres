import type { GameState } from '../types';
import { DEFAULT_BAG_SIZE } from '../data/items.data';
import { SKILL_IDS } from '../data/skills.data';
import { createInitialSummoningState } from '../data/summoning.data';
import { calculateMaxHp } from '../logic/combat';
import { getActiveMiningRock } from '../logic/mining';
import { getActiveFishingSpot } from '../logic/fishing';
import { getActiveCookingRecipe } from '../logic/cooking';
import { getActiveHerbloreRecipe } from '../logic/herblore';
import { normalizePlayerVitals } from '../logic/player';
import { getSummoningCombatBonuses } from '../logic/summoning';
import { getActiveTree } from '../logic/woodcutting';
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
  const repairedPlayer = normalizePlayerVitals({
    level: state.player?.level ?? initial.player.level,
    xp: state.player?.xp ?? initial.player.xp,
    coins: (state.player as any)?.coins ?? initial.player.coins,
    health: (state.player as any)?.health ?? initial.player.health,
    maxHealth: (state.player as any)?.maxHealth ?? initial.player.maxHealth,
    mana: (state.player as any)?.mana ?? initial.player.mana,
    maxMana: (state.player as any)?.maxMana ?? initial.player.maxMana,
  });
  const rawSkills = (state.skills ?? {}) as Record<string, Partial<GameState['skills']['woodcutting']>>;
  const rawSkillStats = (state.skillStats ?? {}) as Record<string, Partial<GameState['skillStats']['woodcutting']>>;
  const repairedSkills = {
    woodcutting: {
      ...initial.skills.woodcutting,
      ...(rawSkills.woodcutting ?? {}),
    },
    mining: {
      ...initial.skills.mining,
      ...(rawSkills.mining ?? {}),
    },
    crafting: {
      ...initial.skills.crafting,
      ...(rawSkills.crafting ?? rawSkills.smithing ?? {}),
      automationUnlocked: true,
    },
    summoning: {
      ...initial.skills.summoning,
      ...(rawSkills.summoning ?? {}),
    },
    fishing: {
      ...initial.skills.fishing,
      ...(rawSkills.fishing ?? {}),
    },
    cooking: {
      ...initial.skills.cooking,
      ...(rawSkills.cooking ?? {}),
    },
    herblore: {
      ...initial.skills.herblore,
      ...(rawSkills.herblore ?? {}),
    },
  };
  const repairedSkillStats = {
    woodcutting: {
      ...initial.skillStats.woodcutting,
      ...(rawSkillStats.woodcutting ?? {}),
    },
    mining: {
      ...initial.skillStats.mining,
      ...(rawSkillStats.mining ?? {}),
    },
    crafting: {
      ...initial.skillStats.crafting,
      ...(rawSkillStats.crafting ?? rawSkillStats.smithing ?? {}),
    },
    summoning: {
      ...initial.skillStats.summoning,
      ...(rawSkillStats.summoning ?? {}),
    },
    fishing: {
      ...initial.skillStats.fishing,
      ...(rawSkillStats.fishing ?? {}),
    },
    cooking: {
      ...initial.skillStats.cooking,
      ...(rawSkillStats.cooking ?? {}),
    },
    herblore: {
      ...initial.skillStats.herblore,
      ...(rawSkillStats.herblore ?? {}),
    },
  };
  repairedSkills.woodcutting.activeTreeId = getActiveTree(repairedSkills.woodcutting).id;
  repairedSkills.mining.activeRockId = getActiveMiningRock(repairedSkills.mining).id;
  repairedSkills.fishing.activeFishingSpotId = getActiveFishingSpot(repairedSkills.fishing).id;
  repairedSkills.cooking.activeCookingRecipeId = getActiveCookingRecipe(repairedSkills.cooking).id;
  repairedSkills.herblore.activeHerbloreRecipeId = getActiveHerbloreRecipe(repairedSkills.herblore).id;
  const initialSummoning = createInitialSummoningState();
  const rawSummoning = (state.summoning ?? {}) as Partial<GameState['summoning']>;
  const repairedSummoning = {
    ...initial.summoning,
    ...rawSummoning,
    pets: {
      ...initialSummoning.pets,
      ...(rawSummoning.pets ?? {}),
    },
  };
  const normalizedSummoning = {
    ...repairedSummoning,
    activePetId: repairedSummoning.activePetId
      && repairedSummoning.pets[repairedSummoning.activePetId]?.unlocked
      ? repairedSummoning.activePetId
      : initialSummoning.activePetId,
  };
  const repairedMultipliers = {
    ...initial.multipliers,
    ...(state.multipliers ?? {}),
    active: ((state.multipliers?.active ?? initial.multipliers.active) as Array<any>).map((multiplier) => (
      multiplier.target === 'smithing'
        ? { ...multiplier, target: 'crafting' }
        : multiplier
    )),
  };
  const activeSkill = state.activeSkill === 'smithing' ? 'crafting' : state.activeSkill ?? null;
  const knownSkillIds = new Set<string>(SKILL_IDS);
  const normalizedActiveSkill = (
    activeSkill
    && activeSkill !== 'crafting'
    && knownSkillIds.has(activeSkill)
  ) ? activeSkill : null;
  const automationQuantity = Math.max(
    1,
    Math.floor((state.crafting as any)?.automation?.quantity ?? initial.crafting.automation.quantity)
  );
  const automationTickProgress = Math.max(
    0,
    Number((state.crafting as any)?.automation?.tickProgress ?? initial.crafting.automation.tickProgress)
  );
  const rawAutomationRecipeId = (state.crafting as any)?.automation?.recipeId ?? initial.crafting.automation.recipeId;
  const automationRecipeId = typeof rawAutomationRecipeId === 'string' ? rawAutomationRecipeId : null;
  const repairedCombatSkills = {
    ...initial.combat.combatSkills,
    ...(state.combat?.combatSkills ?? {}),
  };
  const petBonuses = getSummoningCombatBonuses(normalizedSummoning, repairedSkills.summoning.level);
  const repairedPlayerMaxHp = calculateMaxHp(repairedCombatSkills, petBonuses.maxHpBonus);
  const activeCombat = state.combat?.activeCombat
    ? {
        ...state.combat.activeCombat,
        petNextAttackAt: state.combat.activeCombat.petNextAttackAt
          ?? Math.min(
            state.combat.activeCombat.playerNextAttackAt,
            state.combat.activeCombat.enemyNextAttackAt
          ),
      }
    : null;

  return {
    player: repairedPlayer,
    skills: repairedSkills,
    attributes: {
      ...initial.attributes,
      ...state.attributes,
    },
    skillStats: repairedSkillStats,
    resources: {
      ...initial.resources,
      ...state.resources,
    },
    bag: normalizeBag(state.bag ?? initial.bag),
    bagSettings: {
      autoSort: state.bagSettings?.autoSort ?? initial.bagSettings.autoSort,
      sortMode: state.bagSettings?.sortMode ?? initial.bagSettings.sortMode,
      activeTabIndex: (state.bagSettings as any)?.activeTabIndex ?? initial.bagSettings.activeTabIndex,
    },
    quests: state.quests ?? initial.quests,
    achievements: state.achievements ?? initial.achievements,
    multipliers: repairedMultipliers,
    crafting: {
      ...initial.crafting,
      ...(state.crafting ?? {}),
      infrastructureLevels: {
        ...initial.crafting.infrastructureLevels,
        ...(state.crafting?.infrastructureLevels ?? {}),
      },
      automation: {
        ...initial.crafting.automation,
        ...((state.crafting as any)?.automation ?? {}),
        recipeId: automationRecipeId,
        quantity: automationQuantity,
        tickProgress: automationTickProgress,
      },
    },
    summoning: normalizedSummoning,
    combat: {
      ...initial.combat,
      ...(state.combat ?? {}),
      combatSkills: repairedCombatSkills,
      equipment: {
        ...initial.combat.equipment,
        ...(state.combat?.equipment ?? {}),
      },
      selectedEnemyByZone: (state.combat as any)?.selectedEnemyByZone ?? initial.combat.selectedEnemyByZone,
      playerMaxHp: repairedPlayerMaxHp,
      playerCurrentHp: Math.min(
        state.combat?.playerCurrentHp ?? initial.combat.playerCurrentHp,
        repairedPlayerMaxHp
      ),
      activeCombat,
    },
    timestamps: {
      lastActive: state.timestamps?.lastActive ?? initial.timestamps.lastActive,
      lastSave: state.timestamps?.lastSave ?? initial.timestamps.lastSave,
      sessionStart: now, // Always reset session start
    },
    activeSkill: normalizedActiveSkill,
    rngSeed: state.rngSeed ?? initial.rngSeed,
    // Notifications are transient UI state - always reset to empty on load
    notifications: createInitialNotificationsState(),
  };
}
