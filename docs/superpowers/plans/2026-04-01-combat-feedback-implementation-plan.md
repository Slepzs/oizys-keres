# Combat Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an in-screen combat rhythm panel and a transient combat log so combat feels readable and responsive without changing combat mechanics.

**Architecture:** Keep combat mechanics untouched and add a UI-only feedback layer in the Zustand store. Map high-signal combat events from the tick pipeline into a transient combat feedback slice, then render two new combat-screen widgets: timer bars derived from existing timestamps and a short rolling combat transcript.

**Tech Stack:** React Native, TypeScript, Expo Router, Zustand, pure game logic under `game/`

---

### Task 1: Add transient combat feedback state

**Files:**
- Modify: `store/gameStore.ts`
- Modify: `store/slices/tickSlice.ts`
- Modify: `store/index.ts`
- Modify: `store/selectors.ts`
- Test: `game/logic/combat/tick.regression.test.js`

- [ ] **Step 1: Write the failing test**

Add a regression test case in `game/logic/combat/tick.regression.test.js` that feeds a combat tick result into the new event-to-log mapper and asserts:
- only high-signal combat events produce entries
- kill count increments only on `COMBAT_ENEMY_KILLED`
- entries are capped and newest-first

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test game/logic/combat/tick.regression.test.js`
Expected: FAIL because the combat feedback mapper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement:
- a transient `combatFeedback` store field in `store/gameStore.ts`
- a small pure helper in `store/slices/tickSlice.ts` (or nearby) that maps `GameEvent[]` into log entries and session kill count
- selector support in `store/selectors.ts`
- exports from `store/index.ts`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test game/logic/combat/tick.regression.test.js`
Expected: PASS for the new mapper-focused test.

- [ ] **Step 5: Commit**

```bash
git add game/logic/combat/tick.regression.test.js store/gameStore.ts store/slices/tickSlice.ts store/selectors.ts store/index.ts
git commit -m "feat: add transient combat feedback state"
```

### Task 2: Add combat rhythm and combat log components

**Files:**
- Create: `ui/components/game/CombatRhythmCard.tsx`
- Create: `ui/components/game/CombatLogCard.tsx`
- Modify: `ui/components/game/index.ts`
- Modify: `ui/screens/CombatScreen.tsx`

- [ ] **Step 1: Write the failing test**

Because this repo does not have a React component test harness configured, define the failure first by wiring the screen to import the planned components before they exist. Confirm TypeScript or lint fails on missing modules.

- [ ] **Step 2: Run verification to confirm failure**

Run: `pnpm lint`
Expected: FAIL because `CombatRhythmCard` and `CombatLogCard` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement:
- `CombatRhythmCard.tsx` using local timer updates while combat is active
- `CombatLogCard.tsx` rendering newest-first entries and session kills
- exports in `ui/components/game/index.ts`
- integrate both cards into `ui/screens/CombatScreen.tsx` under the active combat display

- [ ] **Step 4: Run verification to confirm pass**

Run: `pnpm lint`
Expected: PASS with the new components integrated cleanly.

- [ ] **Step 5: Commit**

```bash
git add ui/components/game/CombatRhythmCard.tsx ui/components/game/CombatLogCard.tsx ui/components/game/index.ts ui/screens/CombatScreen.tsx
git commit -m "feat: add combat rhythm and log ui"
```

### Task 3: End-to-end verification and cleanup

**Files:**
- Review: `store/selectors.ts`
- Review: `ui/screens/CombatScreen.tsx`
- Review: `store/slices/tickSlice.ts`

- [ ] **Step 1: Verify selector safety**

Check that Zustand selectors only return primitives or stable store fields, and derived timer math stays in `useMemo` or component logic.

- [ ] **Step 2: Run full verification**

Run:
- `pnpm lint`
- `node --test game/logic/combat/tick.regression.test.js`

Expected:
- lint passes
- mapper/regression tests pass

- [ ] **Step 3: Manual review**

Inspect the combat screen visually and confirm:
- timer bars show player/enemy/pet cadence
- combat log is in-screen, not toast-based
- log shows only high-signal events
- entries do not persist across restart

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: improve combat feedback readability"
```
