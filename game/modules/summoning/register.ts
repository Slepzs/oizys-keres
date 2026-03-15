import type { GameModule } from '../types';
import { registerSummoningHandlers } from '../../systems/summoning-handler';

export const summoningModule: GameModule = {
  id: 'summoning',
  register: () => {
    registerSummoningHandlers();
  },
};
