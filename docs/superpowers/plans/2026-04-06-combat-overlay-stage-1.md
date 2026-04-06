# Combat Overlay Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current battle telemetry card stack with a side-view battle lane shell that uses placeholder actors, preserves existing combat information, and prepares the screen for later tactical abilities and boss prompts.

**Architecture:** Keep all combat outcomes in the existing store and combat tick logic. Introduce a small pure view-model helper for battle-scene presentation, then render a new `CombatBattleScene` UI composed into the existing combat battle view. Reuse existing combat feedback for the log and existing combat state for HP/timing, but move the main visual emphasis to the lane and bottom action bar shell.

**Tech Stack:** React Native, TypeScript, Zustand selectors, pure helper modules tested with `node:test`, existing Expo/React Native UI stack

---

### Task 1: Add a Pure Battle Scene View Model

**Files:**
- Create: `ui/screens/combat/battle-scene.model.ts`
- Test: `ui/screens/combat/battle-scene.model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBattleSceneModel } from './battle-scene.model.ts';

test('builds an active scene model with player, enemy, action slots, and boss prompt shell state', () => {
  const model = buildBattleSceneModel({
    activeCombat: {
      enemyId: 'rat',
      enemyCurrentHp: 12,
      playerCurrentHp: 70,
      playerMaxHp: 100,
      playerNextAttackAt: 1_000,
      enemyNextAttackAt: 1_200,
      petNextAttackAt: null,
      zoneId: 'sewers',
    },
    totalKills: 44,
    totalDeaths: 3,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: 3,
    now: 900,
  });

  assert.equal(model.state, 'active');
  assert.equal(model.enemy.id, 'rat');
  assert.equal(model.actionSlots.length, 4);
  assert.equal(model.bossPrompt, null);
});

test('builds an idle scene model with waiting copy when combat is inactive', () => {
  const model = buildBattleSceneModel({
    activeCombat: null,
    totalKills: 0,
    totalDeaths: 0,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: null,
    now: 900,
  });

  assert.equal(model.state, 'idle');
  assert.match(model.idleTitle, /awaiting/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test ui/screens/combat/battle-scene.model.test.ts
```

Expected: FAIL because `battle-scene.model.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement `buildBattleSceneModel` with:
- active vs idle state
- enemy metadata lookup from `ENEMY_DEFINITIONS`
- player/enemy health progress
- a fixed 4-slot action bar shell
- a nullable boss prompt shell

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test ui/screens/combat/battle-scene.model.test.ts
```

Expected: PASS

### Task 2: Render the Side-View Battle Scene

**Files:**
- Create: `ui/screens/combat/CombatBattleScene.tsx`
- Modify: `ui/screens/combat/CombatBattleView.tsx`
- Modify: `ui/screens/CombatScreen.tsx`
- Test: `ui/screens/combat/battle-scene.model.test.ts`

- [ ] **Step 1: Write the failing test for any new scene-model behavior needed by the UI**

If the UI needs extra derived data, add it first to `battle-scene.model.test.ts`. Example:

```ts
test('marks an enemy attack window as imminent when the next attack is close', () => {
  const model = buildBattleSceneModel({
    activeCombat: {
      enemyId: 'rat',
      enemyCurrentHp: 10,
      playerCurrentHp: 70,
      playerMaxHp: 100,
      playerNextAttackAt: 2_000,
      enemyNextAttackAt: 1_050,
      petNextAttackAt: null,
      zoneId: 'sewers',
    },
    totalKills: 10,
    totalDeaths: 1,
    playerAttackIntervalSeconds: 2.4,
    enemyAttackIntervalSeconds: 3,
    now: 1_000,
  });

  assert.equal(model.enemy.telegraphState, 'imminent');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run the same targeted command as Task 1 and confirm the new assertion fails.

- [ ] **Step 3: Implement the UI**

Create `CombatBattleScene.tsx` to render:
- top encounter summary strip
- player placeholder actor
- enemy placeholder actor
- optional next-enemy placeholder shell
- cast / rhythm strip
- optional boss prompt shell
- bottom action bar

Then update `CombatBattleView.tsx` to:
- use the new scene model
- keep `CombatLogCard`
- keep the flee action
- de-emphasize the old `EnemyDisplay` card structure

Keep the scene placeholder-only. No ability logic yet.

- [ ] **Step 4: Run the scene-model test again**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test ui/screens/combat/battle-scene.model.test.ts
```

Expected: PASS

### Task 3: Align Battle Tab Behavior With the New Scene

**Files:**
- Modify: `ui/screens/combat/useCombatScreenView.ts`
- Modify: `ui/screens/combat-screen.sections.test.ts`
- Modify: `ui/screens/CombatScreen.tsx`

- [ ] **Step 1: Write the failing test**

Add or adjust a test in `ui/screens/combat-screen.sections.test.ts` if the new battle scene should remain the default view while combat is active or should better preserve battle context after entering combat.

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test ui/screens/combat-screen.sections.test.ts
```

Expected: FAIL with the old screen-navigation behavior.

- [ ] **Step 3: Implement the minimal screen-flow change**

Update the section logic only if needed to support the new battle-first interaction model. Do not redesign tab navigation beyond what the test requires.

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test ui/screens/combat-screen.sections.test.ts
```

Expected: PASS

### Task 4: Verify the Stage 1 Slice

**Files:**
- Verify only

- [ ] **Step 1: Run the targeted battle-related tests**

Run:
```bash
node -r tsconfig-paths/register -r sucrase/register --test \
  ui/screens/combat/battle-scene.model.test.ts \
  ui/screens/combat-screen.sections.test.ts
```

Expected: PASS

- [ ] **Step 2: Run the broader existing combat-focused tests**

Run:
```bash
pnpm test:logic
```

Expected: PASS

- [ ] **Step 3: Manually sanity-check the combat tab**

Run:
```bash
pnpm start
```

Expected:
- combat tab still loads
- battle view shows the side-view lane
- idle state shows placeholder scene copy
- active combat shows placeholders, bars, flee button, and log

- [ ] **Step 4: Stop and review next slice**

Document follow-up items before moving into abilities:
- whether the placeholder action bar labels feel right
- whether the battle lane needs a next-enemy preview in the first UI pass
- whether boss prompt shell should already appear in Stage 1 for preview purposes
