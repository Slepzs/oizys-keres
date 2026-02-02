import type { GameModule } from './types';
import { achievementsModule } from './achievements/register';
import { combatModule } from './combat/register';
import { notificationsModule } from './notifications/register';
import { questsModule } from './quests/register';

export const ALL_GAME_MODULES: GameModule[] = [
  questsModule,
  combatModule,
  achievementsModule,
  notificationsModule,
];
