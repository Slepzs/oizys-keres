import { createInitialAchievementsState } from "../data/achievements.data";
import { createInitialBagState } from "../data/items.data";
import { createInitialQuestsState } from "../data/quests.data";
import { createInitialResourcesState } from "../data/resources.data";
import { createInitialSkillsState } from "../data/skills.data";
import { createInitialCraftingState } from "../data/crafting.data";
import {
	createInitialAttributesState,
	createInitialSkillStatsState,
} from "../data/stats.data";
import { createInitialCombatState } from "../logic/combat";
import { createInitialMultipliersState } from "../logic/multipliers";
import { playerMaxHealthForLevel, playerMaxManaForLevel } from "../data/curves";
import type { BagSettings, GameState, NotificationsState } from "../types";

export function createInitialBagSettings(): BagSettings {
	return {
		autoSort: false,
		sortMode: "rarity",
		activeTabIndex: 0,
	};
}

export function createInitialNotificationsState(): NotificationsState {
	return {
		items: [],
	};
}

/**
 * Create a fresh game state for new players.
 */
export interface CreateInitialGameStateParams {
	now?: number;
	rngSeed?: number;
}

export function createInitialGameState(params: CreateInitialGameStateParams = {}): GameState {
	const now = params.now ?? Date.now();
	const rngSeed = params.rngSeed ?? Math.floor(Math.random() * 2147483647);
	const startingLevel = 1;
	const startingMaxHealth = playerMaxHealthForLevel(startingLevel);
	const startingMaxMana = playerMaxManaForLevel(startingLevel);

	return {
		player: {
			level: startingLevel,
			xp: 0,
			coins: 0,
			health: startingMaxHealth,
			maxHealth: startingMaxHealth,
			mana: startingMaxMana,
			maxMana: startingMaxMana,
		},
		skills: createInitialSkillsState(),
		attributes: createInitialAttributesState(),
		skillStats: createInitialSkillStatsState(),
		resources: createInitialResourcesState(),
		bag: createInitialBagState(),
		bagSettings: createInitialBagSettings(),
		quests: createInitialQuestsState(),
		achievements: createInitialAchievementsState(),
		multipliers: createInitialMultipliersState(),
		crafting: createInitialCraftingState(),
		combat: createInitialCombatState(),
		timestamps: {
			lastActive: now,
			lastSave: now,
			sessionStart: now,
		},
		activeSkill: null,
		rngSeed,
		notifications: createInitialNotificationsState(),
	};
}
