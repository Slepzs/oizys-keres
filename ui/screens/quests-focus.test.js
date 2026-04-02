const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveQuestSpotlight } = require('./quests-focus.ts');

test('completed spotlight quests force the completed section open', () => {
  const spotlight = resolveQuestSpotlight({
    questId: 'seed_collector',
    readyToClaimIds: [],
    activeQuestIds: [],
    availableQuestIds: [],
    completedQuestIds: ['seed_collector'],
  });

  assert.deepEqual(spotlight, {
    section: 'completed',
    showCompleted: true,
  });
});

test('active spotlight quests stay in the active section without opening completed history', () => {
  const spotlight = resolveQuestSpotlight({
    questId: 'seed_collector',
    readyToClaimIds: [],
    activeQuestIds: ['seed_collector'],
    availableQuestIds: [],
    completedQuestIds: [],
  });

  assert.deepEqual(spotlight, {
    section: 'active',
    showCompleted: false,
  });
});
