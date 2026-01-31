import React, { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameAction, SkillId } from '@/game/types';
import { createInitialGameState } from '@/game/save';
import { processTick } from '@/game/logic';
import { TICK_RATE_MS } from '@/game/data';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  isLoaded: boolean;
}

export const GameContext = createContext<GameContextValue | null>(null);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      const result = processTick(state, action.payload.deltaMs);
      return {
        ...result.state,
        timestamps: {
          ...result.state.timestamps,
          lastActive: Date.now(),
        },
      };
    }

    case 'SET_ACTIVE_SKILL':
      return {
        ...state,
        activeSkill: action.payload.skillId,
      };

    case 'TOGGLE_AUTOMATION': {
      const skillId = action.payload.skillId as SkillId;
      const skill = state.skills[skillId];
      if (!skill || !skill.automationUnlocked) {
        return state;
      }
      return {
        ...state,
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            automationEnabled: !skill.automationEnabled,
          },
        },
      };
    }

    case 'PROCESS_OFFLINE':
      // Handled separately with offline progress calculation
      return state;

    case 'LOAD_SAVE':
      return action.payload.state;

    case 'RESET':
      return createInitialGameState();

    default:
      return state;
  }
}

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialGameState);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const lastTickRef = useRef(Date.now());

  // Game tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;

      dispatch({ type: 'TICK', payload: { deltaMs } });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // Mark as loaded after initial state is set
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const setActiveSkill = useCallback((skillId: SkillId | null) => {
    dispatch({ type: 'SET_ACTIVE_SKILL', payload: { skillId } });
  }, []);

  const toggleAutomation = useCallback((skillId: SkillId) => {
    dispatch({ type: 'TOGGLE_AUTOMATION', payload: { skillId } });
  }, []);

  const value: GameContextValue = {
    state,
    dispatch,
    setActiveSkill,
    toggleAutomation,
    isLoaded,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
