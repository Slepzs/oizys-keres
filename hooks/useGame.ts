import { useContext } from 'react';
import { GameContext } from '@/ui/providers';

/**
 * Access game state and actions.
 * Must be used within a GameProvider.
 */
export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}

/**
 * Access just the game state (for components that only read).
 */
export function useGameState() {
  const { state } = useGame();
  return state;
}

/**
 * Access game actions without state (for performance optimization).
 */
export function useGameActions() {
  const { setActiveSkill, toggleAutomation, dispatch } = useGame();
  return { setActiveSkill, toggleAutomation, dispatch };
}
