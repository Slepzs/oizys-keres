import { eventBus, registerOnce } from './events';
import { PET_DEFINITIONS } from '../data/summoning.data';
import type { NotificationType } from '../types/notifications';

let notificationCallback: ((type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => void) | null = null;

export function setSummoningNotificationCallback(
  callback: (type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => void
): void {
  notificationCallback = callback;
}

export function registerSummoningHandlers(): void {
  registerOnce('summoning-handlers', () => {
    eventBus.on('PET_UNLOCKED', (event, state, _ctx) => {
      if (notificationCallback) {
        const definition = PET_DEFINITIONS[event.petId];
        if (definition) {
          notificationCallback(
            'skill_level_up',
            'Companion Unlocked!',
            `${definition.icon} ${definition.name} is ready to be summoned.`,
            { icon: definition.icon }
          );
        }
      }
      return state;
    }, 200);

    eventBus.on('PET_LEVEL_UP', (event, state, _ctx) => {
      if (notificationCallback && event.newLevel % 10 === 0) {
        const definition = PET_DEFINITIONS[event.petId];
        if (definition) {
          notificationCallback(
            'skill_level_up',
            `${definition.name} Level ${event.newLevel}!`,
            `${definition.icon} Your companion grew stronger.`,
            { icon: definition.icon }
          );
        }
      }
      return state;
    }, 200);

    eventBus.on('PET_EVOLVED', (event, state, _ctx) => {
      if (notificationCallback) {
        const definition = PET_DEFINITIONS[event.petId];
        if (definition) {
          notificationCallback(
            'achievement',
            'Companion Evolved!',
            `${definition.icon} ${definition.name} reached a new stage: ${event.stageId}.`,
            { icon: definition.icon }
          );
        }
      }
      return state;
    }, 200);
  });
}
