import test from 'node:test';
import assert from 'node:assert/strict';

import { totalXpForCombatSkillLevel } from '../../data/curves.ts';
import { createInitialGameState } from '../../save/initial-state.ts';
import { calculateMaxHp } from '../combat.ts';
import {
  buildCombatFarmPlan,
  estimateCombatRoute,
  rankCombatFarmCandidates,
  summarizeCombatFarmsByZone,
  type CombatFarmCandidate,
} from './planning.ts';

function withCombatLevel(level: number) {
  const xp = totalXpForCombatSkillLevel(level);
  const state = createInitialGameState({ now: 1_000, rngSeed: 7 });

  state.combat.combatSkills.attack.xp = xp;
  state.combat.combatSkills.strength.xp = xp;
  state.combat.combatSkills.defense.xp = xp;
  state.combat.playerMaxHp = calculateMaxHp(state.combat.combatSkills);
  state.combat.playerCurrentHp = state.combat.playerMaxHp;

  return state;
}

function asPlanningState(state: ReturnType<typeof createInitialGameState>) {
  return {
    bag: state.bag,
    combat: state.combat,
    summoning: state.summoning,
    summoningLevel: state.skills.summoning.level,
  };
}

test('active pets materially improve projected kill pace', () => {
  const withPet = withCombatLevel(20);
  const withoutPet = withCombatLevel(20);
  withoutPet.summoning.activePetId = null;

  const projectedWithPet = estimateCombatRoute(asPlanningState(withPet), 'skeleton');
  const projectedWithoutPet = estimateCombatRoute(asPlanningState(withoutPet), 'skeleton');

  assert.ok(projectedWithPet.totalDps > projectedWithoutPet.totalDps);
  assert.ok(projectedWithPet.timeToKillSeconds < projectedWithoutPet.timeToKillSeconds);
  assert.ok(projectedWithPet.xpPerMinute > projectedWithoutPet.xpPerMinute);
  assert.ok(projectedWithPet.valuePerMinute > projectedWithoutPet.valuePerMinute);
  assert.ok(
    Math.abs(projectedWithPet.totalValuePerKill - projectedWithoutPet.totalValuePerKill) < 0.0001
  );
});

test('stocked food extends projected sustain for hard fights', () => {
  const starved = withCombatLevel(65);
  const supplied = withCombatLevel(65);

  supplied.bag.slots[0] = { itemId: 'shark', quantity: 20 };

  const starvedProjection = estimateCombatRoute(asPlanningState(starved), 'elder_demon');
  const suppliedProjection = estimateCombatRoute(asPlanningState(supplied), 'elder_demon');

  assert.ok(starvedProjection.netDamagePerKill > 0);
  assert.ok(suppliedProjection.totalHealingStock > starvedProjection.totalHealingStock);
  assert.ok(
    (suppliedProjection.killsBeforeRestock ?? 0) > (starvedProjection.killsBeforeRestock ?? 0)
  );
});

test('overmatched targets are flagged as lethal', () => {
  const state = createInitialGameState({ now: 1_000, rngSeed: 7 });

  const projection = estimateCombatRoute(asPlanningState(state), 'elder_demon');

  assert.equal(projection.risk, 'lethal');
  assert.ok(projection.killsBeforeRestock === 0 || projection.killsBeforeRestock === 1);
  assert.ok(projection.netDamagePerKill > state.combat.playerCurrentHp);
});

test('projected loot value combines average coins and expected sell value from drops', () => {
  const state = withCombatLevel(10);

  const projection = estimateCombatRoute(asPlanningState(state), 'rat');

  assert.equal(projection.averageCoinsPerKill, 2);
  assert.ok(Math.abs(projection.averageLootValuePerKill - 0.875) < 0.0001);
  assert.ok(Math.abs(projection.totalValuePerKill - 2.875) < 0.0001);
});

test('notable drops are sorted by expected value and capped to the top three', () => {
  const state = withCombatLevel(70);

  const projection = estimateCombatRoute(asPlanningState(state), 'elder_demon');

  assert.equal(projection.notableDrops.length, 3);
  assert.deepEqual(
    projection.notableDrops.map((drop) => drop.itemId),
    ['elder_demon_core', 'arcane_warblade', 'arcane_chestplate']
  );
  assert.ok(
    projection.notableDrops[0]!.expectedValuePerKill
      > projection.notableDrops[1]!.expectedValuePerKill
  );
});

function makeCandidate(
  zoneId: string,
  enemyId: string,
  overrides: Partial<CombatFarmCandidate['projection']> = {},
  questOverrides: Partial<NonNullable<CombatFarmCandidate['questRoute']>> | null = null
): CombatFarmCandidate {
  return {
    zoneId,
    zoneName: zoneId,
    zoneIcon: '⚔️',
    enemyId,
    questRoute: questOverrides
      ? {
          enemyId,
          questMatches: 1,
          killsToComplete: 10,
          projectedMinutesToComplete: 2,
          targets: [],
          ...questOverrides,
        }
      : null,
    projection: {
      enemyId,
      enemyName: enemyId,
      timeToKillSeconds: 5,
      xpPerMinute: 60,
      averageCoinsPerKill: 10,
      averageLootValuePerKill: 2,
      totalValuePerKill: 12,
      valuePerMinute: 40,
      playerDps: 10,
      petDps: 0,
      totalDps: 10,
      enemyDps: 4,
      netDamagePerKill: 4,
      totalFoodCount: 10,
      totalHealingStock: 120,
      averageFoodHeal: 12,
      foodPerKill: 1,
      killsBeforeRestock: 12,
      risk: 'steady',
      notableDrops: [],
      ...overrides,
    },
  };
}

test('xp and value focus rank the best viable farm by the requested metric', () => {
  const candidates = [
    makeCandidate('crypt', 'skeleton', { xpPerMinute: 110, valuePerMinute: 55, risk: 'steady' }),
    makeCandidate('stronghold', 'orc', { xpPerMinute: 95, valuePerMinute: 130, risk: 'steady' }),
    makeCandidate('sewers', 'rat', { xpPerMinute: 70, valuePerMinute: 18, risk: 'safe' }),
  ];

  const xpRanked = rankCombatFarmCandidates(candidates, 'xp');
  const valueRanked = rankCombatFarmCandidates(candidates, 'value');

  assert.equal(xpRanked[0]?.enemyId, 'skeleton');
  assert.equal(valueRanked[0]?.enemyId, 'orc');
});

test('viable routes outrank lethal routes even when the lethal route has stronger raw output', () => {
  const candidates = [
    makeCandidate('abyssal_depths', 'elder_demon', {
      xpPerMinute: 400,
      valuePerMinute: 300,
      risk: 'lethal',
      killsBeforeRestock: 0,
      netDamagePerKill: 500,
    }),
    makeCandidate('caves', 'troll', {
      xpPerMinute: 180,
      valuePerMinute: 90,
      risk: 'risky',
      killsBeforeRestock: 8,
      netDamagePerKill: 22,
    }),
  ];

  const xpRanked = rankCombatFarmCandidates(candidates, 'xp');
  const valueRanked = rankCombatFarmCandidates(candidates, 'value');

  assert.equal(xpRanked[0]?.enemyId, 'troll');
  assert.equal(valueRanked[0]?.enemyId, 'troll');
});

test('safe focus and zone summaries choose the safest route instead of the highest-level route', () => {
  const candidates = [
    makeCandidate('sewers', 'rat', {
      xpPerMinute: 65,
      valuePerMinute: 18,
      risk: 'safe',
      killsBeforeRestock: null,
      netDamagePerKill: 0,
    }),
    makeCandidate('sewers', 'nerd', {
      xpPerMinute: 78,
      valuePerMinute: 24,
      risk: 'steady',
      killsBeforeRestock: 40,
      netDamagePerKill: 3,
    }),
    makeCandidate('crypt', 'skeleton', {
      xpPerMinute: 92,
      valuePerMinute: 37,
      risk: 'risky',
      killsBeforeRestock: 4,
      netDamagePerKill: 18,
    }),
  ];

  const safeRanked = rankCombatFarmCandidates(candidates, 'safe');
  const safeZoneSummaries = summarizeCombatFarmsByZone(candidates, 'safe');
  const xpZoneSummaries = summarizeCombatFarmsByZone(candidates, 'xp');

  assert.equal(safeRanked[0]?.enemyId, 'rat');
  assert.equal(safeZoneSummaries.sewers?.enemyId, 'rat');
  assert.equal(xpZoneSummaries.sewers?.enemyId, 'nerd');
});

test('quest focus prioritizes routes that advance active kill quests', () => {
  const candidates = [
    makeCandidate('crypt', 'skeleton', {
      xpPerMinute: 140,
      valuePerMinute: 70,
      risk: 'steady',
    }),
    makeCandidate(
      'sewers',
      'rat',
      {
        xpPerMinute: 65,
        valuePerMinute: 22,
        risk: 'safe',
      },
      {
        questMatches: 1,
        killsToComplete: 12,
        projectedMinutesToComplete: 3,
      }
    ),
  ];

  const questRanked = rankCombatFarmCandidates(candidates, 'quest');

  assert.equal(questRanked[0]?.enemyId, 'rat');
});

test('quest focus metadata tracks overlapping kill objectives on the same enemy', () => {
  const state = withCombatLevel(20);

  state.quests.active = [
    {
      questId: 'sewers_cleanup',
      progress: { rat_kills: 10 },
      completed: false,
      startedAt: 1,
    },
    {
      questId: 'fang_stockpile',
      progress: { rat_kills: 28, rat_fangs: 0 },
      completed: false,
      startedAt: 2,
    },
  ];

  const plan = buildCombatFarmPlan(
    {
      ...asPlanningState(state),
      activeQuests: state.quests.active,
    },
    20,
    'quest'
  );

  assert.equal(plan.bestRoute?.enemyId, 'rat');
  assert.equal(plan.enemyQuestRoutes.rat?.questMatches, 2);
  assert.equal(plan.enemyQuestRoutes.rat?.killsToComplete, 5);
  assert.ok((plan.enemyQuestRoutes.rat?.projectedMinutesToComplete ?? 0) > 0);
  assert.equal(plan.enemyQuestRoutes.wolf?.questMatches ?? 0, 0);
});
