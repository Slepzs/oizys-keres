import { useCallback } from 'react';
import { useGameStore, useIsHydrated } from '@/store';
import type { GameState, GameAction, SkillId } from '@/game/types';

/**
 * Access game state and actions.
 * Maintains API compatibility with the old Context-based implementation.
 */
export function useGame() {
  const state = useGameStore((s) => ({
    player: s.player,
    skills: s.skills,
    resources: s.resources,
    timestamps: s.timestamps,
    activeSkill: s.activeSkill,
    rngSeed: s.rngSeed,
  })) as GameState;

  const storeSetActiveSkill = useGameStore((s) => s.setActiveSkill);
  const storeToggleAutomation = useGameStore((s) => s.toggleAutomation);
  const storeTick = useGameStore((s) => s.tick);
  const storeLoadSave = useGameStore((s) => s.loadSave);
  const storeReset = useGameStore((s) => s.reset);
  const isLoaded = useIsHydrated();

  // Legacy dispatch function for backwards compatibility
  const dispatch = useCallback(
    (action: GameAction) => {
      switch (action.type) {
        case 'TICK':
          storeTick(action.payload.deltaMs);
          break;
        case 'SET_ACTIVE_SKILL':
          storeSetActiveSkill(action.payload.skillId as SkillId | null);
          break;
        case 'TOGGLE_AUTOMATION':
          storeToggleAutomation(action.payload.skillId as SkillId);
          break;
        case 'LOAD_SAVE':
          storeLoadSave(action.payload.state);
          break;
        case 'RESET':
          storeReset();
          break;
        case 'PROCESS_OFFLINE':
          // Handled automatically by store rehydration
          break;
      }
    },
    [storeTick, storeSetActiveSkill, storeToggleAutomation, storeLoadSave, storeReset]
  );

  const setActiveSkill = useCallback(
    (skillId: SkillId | null) => {
      storeSetActiveSkill(skillId);
    },
    [storeSetActiveSkill]
  );

  const toggleAutomation = useCallback(
    (skillId: SkillId) => {
      storeToggleAutomation(skillId);
    },
    [storeToggleAutomation]
  );

  return {
    state,
    dispatch,
    setActiveSkill,
    toggleAutomation,
    isLoaded,
  };
}

/**
 * Access just the game state (for components that only read).
 */
export function useGameState() {
  return useGameStore((s) => ({
    player: s.player,
    skills: s.skills,
    resources: s.resources,
    timestamps: s.timestamps,
    activeSkill: s.activeSkill,
    rngSeed: s.rngSeed,
  })) as GameState;
}

/**
 * Access game actions without state (for performance optimization).
 */
export function useGameActions() {
  const setActiveSkill = useGameStore((s) => s.setActiveSkill);
  const toggleAutomation = useGameStore((s) => s.toggleAutomation);
  const tick = useGameStore((s) => s.tick);
  const loadSave = useGameStore((s) => s.loadSave);
  const reset = useGameStore((s) => s.reset);

  // Legacy dispatch for backwards compatibility
  const dispatch = useCallback(
    (action: GameAction) => {
      switch (action.type) {
        case 'TICK':
          tick(action.payload.deltaMs);
          break;
        case 'SET_ACTIVE_SKILL':
          setActiveSkill(action.payload.skillId as SkillId | null);
          break;
        case 'TOGGLE_AUTOMATION':
          toggleAutomation(action.payload.skillId as SkillId);
          break;
        case 'LOAD_SAVE':
          loadSave(action.payload.state);
          break;
        case 'RESET':
          reset();
          break;
      }
    },
    [tick, setActiveSkill, toggleAutomation, loadSave, reset]
  );

  return { setActiveSkill, toggleAutomation, dispatch };
}
