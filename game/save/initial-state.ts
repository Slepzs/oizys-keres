import { createInitialAchievementsState } from "../data/achievements.data";
import { createInitialBagState } from "../data/items.data";
import { createInitialQuestsState } from "../data/quests.data";
import { createInitialResourcesState } from "../data/resources.data";
import { createInitialSkillsState } from "../data/skills.data";
import {
	createInitialAttributesState,
	createInitialSkillStatsState,
} from "../data/stats.data";
import { createInitialMultipliersState } from "../logic/multipliers";
import type { BagSettings, GameState } from "../types";

export function createInitialBagSettings(): BagSettings {
	return {
		autoSort: false,
		sortMode: "rarity",
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
		achievements: createInitialAchievementsState(),
		multipliers: createInitialMultipliersState(),
		timestamps: {
			lastActive: now,
			lastSave: now,
			sessionStart: now,
		},
		activeSkill: null,
		rngSeed: Math.floor(Math.random() * 2147483647),
	};
}
