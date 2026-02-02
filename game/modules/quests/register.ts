import type { GameModule } from '../types';
import { registerQuestHandlers } from '../../systems';

export const questsModule: GameModule = {
  id: 'quests',
  register: () => {
    registerQuestHandlers();
  },
};

