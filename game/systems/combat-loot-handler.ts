import { eventBus, registerOnce } from './events';
import type { GameEvent } from './events.types';
import { COMBAT_DROP_TABLES } from '../data/combat-drops.data';
import { createRng, randomInt, rollChance, advanceSeed } from '../logic/rng';
import { addItemToBag } from '../logic/bag';

/**
 * Register combat loot handlers with the event bus.
 * Grants coins + item drops on enemy kills.
 */
export function registerCombatLootHandlers(): void {
  registerOnce('combat-loot-handlers', () => {
    // Priority 60 ensures loot events are emitted before achievements (100) and notifications (200).
    eventBus.on('COMBAT_ENEMY_KILLED', (event, state, _ctx) => {
      const table = COMBAT_DROP_TABLES[event.enemyId];
      if (!table) {
        return state;
      }

      const rng = createRng(state.rngSeed);
      const emitted: GameEvent[] = [];

      const coins = randomInt(rng, table.coins.min, table.coins.max + 1);

      let newState = {
        ...state,
        rngSeed: advanceSeed(state.rngSeed),
      };

      if (coins > 0) {
        newState = {
          ...newState,
          player: {
            ...newState.player,
            coins: newState.player.coins + coins,
          },
        };
        emitted.push({ type: 'COINS_EARNED', source: 'combat', enemyId: event.enemyId, amount: coins });
      }

      for (const drop of table.items) {
        if (!rollChance(rng, drop.chance)) {
          continue;
        }

        const quantity = randomInt(rng, drop.minQuantity, drop.maxQuantity + 1);
        const bagResult = addItemToBag(newState.bag, drop.itemId, quantity);
        newState = {
          ...newState,
          bag: bagResult.bag,
        };

        if (bagResult.added > 0) {
          emitted.push({
            type: 'COMBAT_ITEM_DROPPED',
            enemyId: event.enemyId,
            itemId: drop.itemId,
            quantity: bagResult.added,
          });
        }

        if (bagResult.overflow > 0) {
          emitted.push({ type: 'BAG_FULL', itemId: drop.itemId, quantity: bagResult.overflow });
        }
      }

      return emitted.length > 0 ? { state: newState, events: emitted } : newState;
    }, 60);
  });
}

