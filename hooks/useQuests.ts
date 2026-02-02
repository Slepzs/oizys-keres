import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, useQuests as useQuestsState } from '@/store';
import type { GameState, QuestsState, QuestDefinition, PlayerQuestState } from '@/game/types';
import {
  getAvailableQuests,
  getReadyToClaimQuests,
  getActiveIncompleteQuests,
  getQuestProgress,
  getCooldownRemaining,
  getCompletedQuests,
  type CompletedQuestInfo,
} from '@/game/logic';
import { QUEST_DEFINITIONS, getQuestDefinition } from '@/game/data';

interface QuestWithProgress {
  definition: QuestDefinition;
  state: PlayerQuestState;
  progress: number;
  isComplete: boolean;
}

interface UseQuestsReturn {
  // State selectors
  activeQuests: QuestWithProgress[];
  readyToClaim: QuestWithProgress[];
  availableQuests: QuestDefinition[];
  completedQuests: CompletedQuestInfo[];
  completedQuestIds: string[];
  totalCompleted: number;

  // Actions
  startQuest: (questId: string) => { success: boolean; error?: string };
  abandonQuest: (questId: string) => void;
  claimRewards: (questId: string) => void;

  // Helpers
  getQuestById: (questId: string) => QuestDefinition | undefined;
  getCooldown: (questId: string) => number;
  isQuestActive: (questId: string) => boolean;
}

export function useQuestsHook(): UseQuestsReturn {
  const questsState = useQuestsState();

  const gameState = useGameStore(
    useShallow((s) => ({
      player: s.player,
      skills: s.skills,
      resources: s.resources,
      bag: s.bag,
      quests: s.quests,
      timestamps: s.timestamps,
      activeSkill: s.activeSkill,
      rngSeed: s.rngSeed,
    }))
  ) as GameState;

  const storeStartQuest = useGameStore((s) => s.startQuest);
  const storeAbandonQuest = useGameStore((s) => s.abandonQuest);
  const storeClaimRewards = useGameStore((s) => s.claimQuestRewards);

  // Memoized active quests with progress
  const activeQuests = useMemo((): QuestWithProgress[] => {
    return getActiveIncompleteQuests(questsState).map((state) => {
      const definition = getQuestDefinition(state.questId);
      const { percentage, allComplete } = getQuestProgress(state);
      return {
        definition: definition!,
        state,
        progress: percentage,
        isComplete: allComplete,
      };
    }).filter((q) => q.definition);
  }, [questsState]);

  // Memoized ready to claim quests
  const readyToClaim = useMemo((): QuestWithProgress[] => {
    return getReadyToClaimQuests(questsState).map((state) => {
      const definition = getQuestDefinition(state.questId);
      return {
        definition: definition!,
        state,
        progress: 1,
        isComplete: true,
      };
    }).filter((q) => q.definition);
  }, [questsState]);

  // Memoized available quests
  const availableQuests = useMemo((): QuestDefinition[] => {
    return getAvailableQuests(gameState, questsState, Date.now());
  }, [gameState, questsState]);

  // Memoized completed quests
  const completedQuests = useMemo((): CompletedQuestInfo[] => {
    return getCompletedQuests(questsState);
  }, [questsState]);

  // Actions wrapped with useCallback
  const startQuest = useCallback(
    (questId: string) => storeStartQuest(questId),
    [storeStartQuest]
  );

  const abandonQuest = useCallback(
    (questId: string) => storeAbandonQuest(questId),
    [storeAbandonQuest]
  );

  const claimRewards = useCallback(
    (questId: string) => storeClaimRewards(questId),
    [storeClaimRewards]
  );

  // Helpers
  const getQuestById = useCallback(
    (questId: string) => getQuestDefinition(questId),
    []
  );

  const getCooldown = useCallback(
    (questId: string) => getCooldownRemaining(questId, questsState, Date.now()),
    [questsState]
  );

  const isQuestActive = useCallback(
    (questId: string) => questsState.active.some((q: PlayerQuestState) => q.questId === questId),
    [questsState]
  );

  return {
    activeQuests,
    readyToClaim,
    availableQuests,
    completedQuests,
    completedQuestIds: questsState.completed,
    totalCompleted: questsState.totalCompleted,
    startQuest,
    abandonQuest,
    claimRewards,
    getQuestById,
    getCooldown,
    isQuestActive,
  };
}

// Re-export the store selector for simple cases
export { useQuestsState as useQuestsStore };
