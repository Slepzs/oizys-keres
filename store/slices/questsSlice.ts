import type { GameState } from '@/game/types';
import { applyQuestRewards, abandonQuest as abandonQuestLogic, startQuest as startQuestLogic } from '@/game/logic';
import type { SliceGet, SliceSet, StoreHelpers } from './types';

export interface QuestsSlice {
  startQuest: (questId: string) => { success: boolean; error?: string };
  abandonQuest: (questId: string) => void;
  claimQuestRewards: (questId: string) => void;
}

export function createQuestsSlice(set: SliceSet, get: SliceGet, helpers: StoreHelpers): QuestsSlice {
  return {
    startQuest: (questId: string) => {
      const state = get();
      const now = Date.now();
      const gameState: GameState = helpers.getGameStateSnapshot(state);
      const result = startQuestLogic(questId, gameState, state.quests, now);
      if (result.success) {
        set({ quests: result.quests });
      }
      return { success: result.success, error: result.error };
    },

    abandonQuest: (questId: string) => {
      const state = get();
      const newQuests = abandonQuestLogic(questId, state.quests);
      set({ quests: newQuests });
    },

    claimQuestRewards: (questId: string) => {
      const state = get();
      const now = Date.now();
      const gameState: GameState = helpers.getGameStateSnapshot(state);
      const result = applyQuestRewards(gameState, state.quests, questId, now);
      set({
        player: result.state.player,
        skills: result.state.skills,
        attributes: result.state.attributes,
        skillStats: result.state.skillStats,
        resources: result.state.resources,
        bag: result.state.bag,
        quests: result.quests,
        multipliers: result.state.multipliers,
        combat: result.state.combat,
      });
    },
  };
}
