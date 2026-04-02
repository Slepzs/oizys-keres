const test = require('node:test');
const assert = require('node:assert/strict');

const { totalXpForCombatSkillLevel } = require('../data/curves.ts');
const { QUEST_IDS, getQuestDefinition } = require('../data/quests.data.ts');
const { createInitialGameState } = require('../save/initial-state.ts');
const { getCompletionProgress } = require('./progress.ts');

const NON_COMBAT_TOTAL = QUEST_IDS.filter((questId) => {
  const definition = getQuestDefinition(questId);

  if (!definition || definition.repeatable) {
    return false;
  }

  if (!definition.category || !new Set(['skill', 'exploration']).has(definition.category)) {
    return false;
  }

  return !definition.objectives.some((objective) => objective.type === 'kill');
}).length;

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
    focusArea: 'quests',
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
    focusArea: 'combat',
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
    focusArea: 'combat',
    title: 'Reach combat level 65',
    detail: "Dragonkin is active, but Dragon Whelp in Dragon's Lair is still locked.",
    actionLabel: 'Unlock the next final hunt',
    questId: 'dragonkin',
    enemyId: 'dragon_whelp',
    zoneId: 'dragon_lair',
  });
});

test('completion progress surfaces the next available non-combat quest as a secondary recommendation', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = ['first_steps', 'wood_for_days'];

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.nonCombat, {
    completedCount: 0,
    total: NON_COMBAT_TOTAL,
    progress: 0,
    nextCategory: 'skill',
    blocker: {
      kind: 'ready',
      label: 'Ready now',
      detail: 'Aspiring Lumberjack can be started immediately.',
    },
  });
  assert.deepEqual(summary.nonCombatRecommendation, {
    kind: 'start-quest',
    focusArea: 'quests',
    title: 'Start Aspiring Lumberjack',
    detail: 'Train woodcutting seriously and secure seed reserves.',
    actionLabel: 'Next non-combat quest',
    questId: 'aspiring_lumberjack',
  });
});

test('completion progress recommends skill training when the next non-combat quest is skill-gated', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = [
    'aspiring_lumberjack',
    'copper_vein',
    'iron_hand',
    'coal_runner',
    'mithril_seeker',
    'adamantite_lord',
    'forge_journeyman',
    'bonded_companion',
    'awakened_bond',
    'ascending_spirit',
    'mythic_pact',
  ];

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.nonCombat, {
    completedCount: 11,
    total: NON_COMBAT_TOTAL,
    progress: 11 / NON_COMBAT_TOTAL,
    nextCategory: 'exploration',
    blocker: {
      kind: 'skill',
      label: 'woodcutting level 3',
      detail: 'Seed Collector is gated by a woodcutting requirement.',
      progress: {
        current: 1,
        target: 3,
        progress: 1 / 3,
        label: 'Level 1 / 3',
      },
    },
  });
  assert.deepEqual(summary.nonCombatRecommendation, {
    kind: 'train-skill',
    focusArea: 'skills',
    title: 'Reach woodcutting level 3',
    detail: 'Seed Collector unlocks once woodcutting reaches level 3.',
    actionLabel: 'Unlock the next non-combat quest',
    questId: 'seed_collector',
    skillId: 'woodcutting',
  });
});

test('completion progress marks the support track as blocked by the active non-combat quest', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = ['first_steps', 'wood_for_days'];
  state.quests.active = [
    {
      questId: 'aspiring_lumberjack',
      progress: {
        level: 5,
        seed_stock: 1,
      },
      completed: false,
      startedAt: 9_500,
    },
  ];

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.nonCombat, {
    completedCount: 0,
    total: NON_COMBAT_TOTAL,
    progress: 0,
    nextCategory: 'skill',
    blocker: {
      kind: 'active',
      label: 'Active quest',
      detail: '3 levels and 4 tree seeds remaining',
      progress: {
        current: 31,
        target: 100,
        progress: 0.3125,
        label: '31% complete',
      },
    },
  });
});

test('completion progress quantifies prerequisite quest blockers for the support track', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });

  state.quests.completed = [
    'aspiring_lumberjack',
    'copper_vein',
    'iron_hand',
    'coal_runner',
    'mithril_seeker',
    'adamantite_lord',
    'forge_journeyman',
  ];
  state.quests.active = [
    {
      questId: 'first_ritual',
      progress: {
        xp: 125,
        essence: 10,
      },
      completed: false,
      startedAt: 9_500,
    },
  ];

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.nonCombat, {
    completedCount: 7,
    total: NON_COMBAT_TOTAL,
    progress: 7 / NON_COMBAT_TOTAL,
    nextCategory: 'skill',
    blocker: {
      kind: 'prerequisite',
      label: 'First Ritual',
      detail: 'Bonded Companion is blocked by a prerequisite quest.',
      progress: {
        current: 50,
        target: 100,
        progress: 0.5,
        label: '50% complete',
      },
    },
  });
});

test('completion progress exposes combat ascension focus after the final contracts are cleared', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });
  const combatXp = totalXpForCombatSkillLevel(90);

  state.player.level = 100;
  state.quests.totalCompleted = 100;
  state.quests.completed = [
    'demon_contract',
    'abyss_walker',
    'silencer',
    'ruins_warden',
    'dragonkin',
    'elder_nemesis',
  ];
  state.combat.totalKills = 10_000;
  state.combat.combatSkills.attack.xp = combatXp;
  state.combat.combatSkills.strength.xp = combatXp;
  state.combat.combatSkills.defense.xp = combatXp;

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.recommendation, {
    kind: 'finish-ascension',
    focusArea: 'combat',
    title: 'Push combat level',
    detail: '90/99 recorded toward the final ledger.',
    actionLabel: '9 remaining',
  });
});

test('completion progress marks the ledger complete once every tracked target is finished', () => {
  const state = createInitialGameState({ now: 10_000, rngSeed: 9 });
  const combatXp = totalXpForCombatSkillLevel(99);

  state.player.level = 100;
  state.quests.totalCompleted = 100;
  state.quests.completed = [
    'demon_contract',
    'abyss_walker',
    'silencer',
    'ruins_warden',
    'dragonkin',
    'elder_nemesis',
  ];
  state.combat.totalKills = 10_000;
  state.combat.combatSkills.attack.xp = combatXp;
  state.combat.combatSkills.strength.xp = combatXp;
  state.combat.combatSkills.defense.xp = combatXp;

  const summary = getCompletionProgress(state);

  assert.deepEqual(summary.recommendation, {
    kind: 'complete-ledger',
    focusArea: 'completion',
    title: 'Last Ledger Closed',
    detail: 'Every tracked completion target is done.',
    actionLabel: 'System complete',
  });
});
