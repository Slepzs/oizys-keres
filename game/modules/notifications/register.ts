import type { GameModule } from '../types';
import { registerNotificationHandlers } from '../../systems';

export const notificationsModule: GameModule = {
  id: 'notifications',
  register: () => {
    registerNotificationHandlers();
  },
};

