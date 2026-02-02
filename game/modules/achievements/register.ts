import type { GameModule } from '../types';
import { registerAchievementHandlers } from '../../systems';

export const achievementsModule: GameModule = {
  id: 'achievements',
  register: () => {
    registerAchievementHandlers();
  },
};

