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
    params: {
      questId: 'ruins_warden',
    },
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

test('non-combat quest recommendations can start the next quest directly', () => {
  const action = getCompletionRecommendationAction({
    kind: 'start-quest',
    focusArea: 'quests',
    title: 'Start First Cast',
    detail: 'Try your luck at the pond and reel in some shrimp.',
    actionLabel: 'Next non-combat quest',
    questId: 'first_cast',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Start quest',
    route: '/quests',
    params: {
      questId: 'first_cast',
    },
    shouldStartQuest: true,
    questId: 'first_cast',
  });
});

test('skill-gated non-combat recommendations route back to skills training', () => {
  const action = getCompletionRecommendationAction({
    kind: 'train-skill',
    focusArea: 'skills',
    title: 'Reach woodcutting level 3',
    detail: 'Seed Collector unlocks once woodcutting reaches level 3.',
    actionLabel: 'Unlock the next non-combat quest',
    questId: 'seed_collector',
    skillId: 'woodcutting',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Open Woodcutting',
    route: '/skill/woodcutting',
    shouldStartQuest: false,
  });
});

test('active quest recommendations deep link back to the referenced quest board entry', () => {
  const action = getCompletionRecommendationAction({
    kind: 'advance-quest',
    focusArea: 'quests',
    title: 'Advance Seed Collector',
    detail: 'Seed Collector is active in your support track.',
    actionLabel: '2 oak seeds remaining',
    questId: 'seed_collector',
  });

  assert.deepEqual(action, {
    ctaLabel: 'Open quests',
    route: '/quests',
    params: {
      questId: 'seed_collector',
    },
    shouldStartQuest: false,
    questId: 'seed_collector',
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
