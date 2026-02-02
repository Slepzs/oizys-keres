import type { GameModule } from '../types';
import { registerCombatLootHandlers } from '../../systems';

export const combatModule: GameModule = {
  id: 'combat',
  register: () => {
    registerCombatLootHandlers();
  },
};

