const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialGameState } = require('../save');
const { eventBus } = require('./events');
const { registerNotificationHandlers, setNotificationCallback } = require('./notification-handler');

registerNotificationHandlers();

test('critical hits do not create combat notifications', () => {
  const notifications = [];

  setNotificationCallback((type, title, message) => {
    notifications.push({ type, title, message });
  });

  eventBus.dispatch(
    [{ type: 'COMBAT_PLAYER_ATTACK', damage: 12, enemyHpRemaining: 0, isCritical: true }],
    createInitialGameState({ now: 0, rngSeed: 1 }),
    { now: 0 }
  );

  assert.deepEqual(notifications, []);
});
