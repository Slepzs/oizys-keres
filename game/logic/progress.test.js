const test = require('node:test');
const assert = require('node:assert/strict');

const { totalXpForCombatSkillLevel } = require('../data/curves.ts');
const { createInitialGameState } = require('../save/initial-state.ts');
const { getCompletionProgress } = require('./progress.ts');

test('completion progress summarizes ascension, hunt guidance, and active final-contract status', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });
  const combatXp = totalXpForCombatSkillLevel(80);

  state.player.level = 88;
  state.quests.totalCompleted = 47;
  state.quests.completed = ['demon_contract', 'abyss_walker'];
  state.quests.active = [
    {
      questId: 'silencer',
      progress: {
        banshee_kills: 3,
        wisps: 1,
      },
      completed: false,
      startedAt: 9_500,
    },
  ];
  state.combat.totalKills = 4_321;
  state.combat.enemyKillCounts = {
    banshee: 14,
    dragon_whelp: 5,
    elder_demon: 2,
  };
  state.combat.combatSkills.attack.xp = combatXp;
  state.combat.combatSkills.strength.xp = combatXp;
  state.combat.combatSkills.defense.xp = combatXp;

  const summary = getCompletionProgress(state);

  assert.equal(summary.ascension.player.current, 88);
  assert.equal(summary.ascension.player.target, 100);
  assert.equal(summary.ascension.combat.current, 80);
  assert.equal(summary.realm.quests.current, 47);
  assert.equal(summary.realm.kills.current, 4_321);
  assert.equal(summary.realm.zones.current, 9);
  assert.equal(summary.finalContracts.completedCount, 2);
  assert.deepEqual(
    summary.finalContracts.entries.map((entry) => ({
      questId: entry.questId,
      status: entry.status,
    })),
    [
      { questId: 'demon_contract', status: 'completed' },
      { questId: 'abyss_walker', status: 'completed' },
      { questId: 'silencer', status: 'active' },
      { questId: 'ruins_warden', status: 'locked' },
      { questId: 'dragonkin', status: 'locked' },
      { questId: 'elder_nemesis', status: 'locked' },
    ]
  );
  assert.deepEqual(
    summary.finalHunts.map((hunt) => ({
      enemyId: hunt.enemyId,
      kills: hunt.kills,
      questStatus: hunt.questStatus,
      questProgress: hunt.questKillProgress,
    })),
    [
      {
        enemyId: 'banshee',
        kills: 14,
        questStatus: 'active',
        questProgress: { current: 3, target: 8, remaining: 5 },
      },
      {
        enemyId: 'dragon_whelp',
        kills: 5,
        questStatus: 'locked',
        questProgress: { current: 0, target: 5, remaining: 5 },
      },
      {
        enemyId: 'elder_demon',
        kills: 2,
        questStatus: 'locked',
        questProgress: { current: 0, target: 3, remaining: 3 },
      },
    ]
  );
});

test('completion progress marks the next final contract as available after the prior chain is done', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = ['demon_contract', 'abyss_walker', 'silencer'];

  const summary = getCompletionProgress(state);

  assert.equal(summary.finalContracts.entries[2]?.status, 'completed');
  assert.equal(summary.finalContracts.entries[3]?.status, 'available');
  assert.equal(summary.finalHunts[0]?.questStatus, 'completed');
  assert.deepEqual(summary.finalHunts[0]?.questKillProgress, {
    current: 8,
    target: 8,
    remaining: 0,
  });
  assert.deepEqual(summary.recommendation, {
    kind: 'start-contract',
    title: 'Start Ruins Warden',
    detail: 'Return to the Haunted Ruins and reopen the banshee hunt.',
    actionLabel: 'Next final contract',
    questId: 'ruins_warden',
    enemyId: 'banshee',
    zoneId: 'ruins',
  });
});

test('completion progress recommends the active final-contract hunt with concrete remaining objectives', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });
  const combatXp = totalXpForCombatSkillLevel(80);

  state.quests.completed = ['demon_contract', 'abyss_walker'];
  state.quests.active = [
    {
      questId: 'silencer',
      progress: {
        banshee_kills: 3,
      },
      completed: false,
      startedAt: 9_500,
    },
  ];
  state.combat.combatSkills.attack.xp = combatXp;
  state.combat.combatSkills.strength.xp = combatXp;
  state.combat.combatSkills.defense.xp = combatXp;

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.recommendation, {
    kind: 'hunt-contract',
    title: 'Hunt Banshee',
    detail: 'The Silencer is active in Haunted Ruins.',
    actionLabel: '5 kills and 2 banshee wisps remaining',
    questId: 'silencer',
    enemyId: 'banshee',
    zoneId: 'ruins',
  });
});

test('completion progress recommends combat training when the active final hunt is not unlocked yet', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = ['demon_contract', 'abyss_walker', 'silencer', 'ruins_warden'];
  state.quests.active = [
    {
      questId: 'dragonkin',
      progress: {},
      completed: false,
      startedAt: 9_500,
    },
  ];

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.recommendation, {
    kind: 'train-combat',
    title: 'Reach combat level 65',
    detail: "Dragonkin is active, but Dragon Whelp in Dragon's Lair is still locked.",
    actionLabel: 'Unlock the next final hunt',
    questId: 'dragonkin',
    enemyId: 'dragon_whelp',
    zoneId: 'dragon_lair',
  });
});
