import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, SkillId } from '@/game/types';
import { createInitialGameState } from '@/game/save';
import { processTick, processOfflineProgress } from '@/game/logic';
import { zustandStorage } from '@/services/mmkv-storage';

interface GameActions {
  tick: (deltaMs: number) => void;
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  loadSave: (state: GameState) => void;
  reset: () => void;
}

interface HydrationState {
  isHydrated: boolean;
}

export type GameStore = GameState & GameActions & HydrationState;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialGameState(),

      // Hydration tracking (will be set true after rehydration)
      isHydrated: false,

      // Actions
      tick: (deltaMs: number) => {
        const state = get();
        const result = processTick(state, deltaMs);
        set({
          ...result.state,
          timestamps: {
            ...result.state.timestamps,
            lastActive: Date.now(),
          },
        });
      },

      setActiveSkill: (skillId: SkillId | null) => {
        set({ activeSkill: skillId });
      },

      toggleAutomation: (skillId: SkillId) => {
        const state = get();
        const skill = state.skills[skillId];
        if (!skill || !skill.automationUnlocked) {
          return;
        }
        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              automationEnabled: !skill.automationEnabled,
            },
          },
        });
      },

      loadSave: (newState: GameState) => {
        set(newState);
      },

      reset: () => {
        set(createInitialGameState());
      },
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        // Only persist game state, not actions or hydration flag
        player: state.player,
        skills: state.skills,
        resources: state.resources,
        timestamps: state.timestamps,
        activeSkill: state.activeSkill,
        rngSeed: state.rngSeed,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate game state:', error);
          // Still mark as hydrated so UI can proceed with initial state
          useGameStore.setState({ isHydrated: true });
          return;
        }

        // Process offline progress if we have stored state
        if (state && state.timestamps) {
          const now = Date.now();
          const currentState: GameState = {
            player: state.player,
            skills: state.skills,
            resources: state.resources,
            timestamps: state.timestamps,
            activeSkill: state.activeSkill,
            rngSeed: state.rngSeed,
          };

          const result = processOfflineProgress(currentState, now);

          if (result.elapsedMs > 60_000) {
            console.log(
              `Processed ${Math.floor(result.elapsedMs / 1000)}s of offline progress`
            );
          }

          // Update store with offline progress and mark as hydrated
          useGameStore.setState({
            player: result.state.player,
            skills: result.state.skills,
            resources: result.state.resources,
            timestamps: result.state.timestamps,
            activeSkill: result.state.activeSkill,
            rngSeed: result.state.rngSeed,
            isHydrated: true,
          });
        } else {
          // No stored state, just mark as hydrated with initial state
          useGameStore.setState({ isHydrated: true });
        }
      },
    }
  )
);

// Selector hooks for performance optimization
export const usePlayer = () => useGameStore((state) => state.player);
export const useSkills = () => useGameStore((state) => state.skills);
export const useResources = () => useGameStore((state) => state.resources);
export const useActiveSkill = () => useGameStore((state) => state.activeSkill);
export const useIsHydrated = () => useGameStore((state) => state.isHydrated);

// Actions (stable references, no re-renders)
export const useGameActions = () =>
  useGameStore((state) => ({
    tick: state.tick,
    setActiveSkill: state.setActiveSkill,
    toggleAutomation: state.toggleAutomation,
    loadSave: state.loadSave,
    reset: state.reset,
  }));
