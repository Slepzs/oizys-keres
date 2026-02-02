import type { GameModule } from './types';
import { ALL_GAME_MODULES } from './registry';

let hasRegistered = false;

export function registerGameModules(modules: GameModule[] = ALL_GAME_MODULES): void {
  if (hasRegistered) {
    return;
  }

  hasRegistered = true;

  for (const module of modules) {
    module.register();
  }
}

