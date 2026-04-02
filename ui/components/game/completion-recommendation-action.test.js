const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getCompletionRecommendationAction,
} = require('./completion-recommendation-action.ts');

test('available contracts map to a quest-start action', () => {
  const action = getCompletionRecommendationAction({
    kind: 'start-contract',
    focusArea: 'quests',
    title: 'Start Ruins Warden',
    detail: 'Return to the Haunted Ruins and reopen the banshee hunt.',
    actionLabel: 'Next final contract',
    questId: 'ruins_warden',
    enemyId: 'banshee',
    zoneId: 'ruins',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Start contract',
    route: '/quests',
    shouldStartQuest: true,
    questId: 'ruins_warden',
  });
});

test('combat recommendations map to a combat focus action', () => {
  const action = getCompletionRecommendationAction({
    kind: 'hunt-contract',
    focusArea: 'combat',
    title: 'Hunt Banshee',
    detail: 'The Silencer is active in Haunted Ruins.',
    actionLabel: '5 kills remaining',
    questId: 'silencer',
    enemyId: 'banshee',
    zoneId: 'ruins',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Open combat',
    route: '/combat',
    shouldStartQuest: false,
    questId: 'silencer',
    enemyId: 'banshee',
    zoneId: 'ruins',
  });
});

test('player ascension recommendations route to skills training', () => {
  const action = getCompletionRecommendationAction({
    kind: 'finish-ascension',
    focusArea: 'player',
    title: 'Push player level',
    detail: '88/100 recorded toward the final ledger.',
    actionLabel: '12 remaining',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Train skills',
    route: '/skills',
    shouldStartQuest: false,
  });
});

test('completed ledgers stay on the progress route', () => {
  const action = getCompletionRecommendationAction({
    kind: 'complete-ledger',
    focusArea: 'completion',
    title: 'Last Ledger Closed',
    detail: 'Every tracked completion target is done.',
    actionLabel: 'System complete',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Review ledger',
    route: '/progress',
    shouldStartQuest: false,
  });
});
