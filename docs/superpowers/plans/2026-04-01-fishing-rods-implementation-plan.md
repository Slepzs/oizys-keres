# Fishing Rods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permanent shop-bought fishing rod unlocks that are required for higher-tier fishing spots and better fish.

**Architecture:** Keep rods as save-backed progression state instead of bag items. Extend shop offers with a permanent unlock effect, add rod requirements to fishing spots, and thread rod ownership through save repair, selectors, and the fishing/shop UI so gating stays deterministic and visible.

**Tech Stack:** React Native, TypeScript, Expo Router, Zustand, pure game logic under `game/`

---

### Task 1: Add failing fishing rod logic tests

**Files:**
- Create: `game/logic/fishing.test.ts`
- Test: `game/logic/fishing.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests covering:
- a spot that is level-unlocked but still unavailable without the required rod
- fallback active spot selection when the saved spot needs an unowned rod
- successful selection once the rod is owned

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test game/logic/fishing.test.ts`
Expected: FAIL because rod-aware fishing helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add rod-aware fishing helpers and types only as needed to satisfy the tests.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test game/logic/fishing.test.ts`
Expected: PASS

### Task 2: Add failing shop purchase tests for permanent rod unlocks

**Files:**
- Create: `game/logic/shop.fishing-rods.test.ts`
- Test: `game/logic/shop.fishing-rods.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests covering:
- buying a rod deducts coins and adds the rod unlock
- rebuying an owned rod fails cleanly

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test game/logic/shop.fishing-rods.test.ts`
Expected: FAIL because rod unlock offers/effects are not implemented yet.

- [ ] **Step 3: Write minimal implementation**

Extend shop types/data/logic to support permanent rod unlock effects and ownership checks.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test game/logic/shop.fishing-rods.test.ts`
Expected: PASS

### Task 3: Wire save state, selectors, and UI

**Files:**
- Modify: `game/types/state.ts`
- Modify: `game/save/schema.ts`
- Modify: `game/save/migrations.ts`
- Modify: `game/save/deserialize.ts`
- Modify: `store/selectors.ts`
- Modify: `ui/components/game/FishingSpotSelector.tsx`
- Modify: `ui/screens/ShopScreen.tsx`

- [ ] **Step 1: Write the failing test**

Use selector/UI-safe logic assertions where possible, then rely on lint/type verification for the UI wiring.

- [ ] **Step 2: Run verification to confirm failure**

Run: `pnpm lint`
Expected: FAIL while the new rod state and UI references are only partially wired.

- [ ] **Step 3: Write minimal implementation**

Implement:
- save-backed fishing gear state with migration
- selector support for rod ownership and rod-aware available spots
- shop section for fishing rods
- fishing spot selector messaging for rod locks

- [ ] **Step 4: Run verification to confirm pass**

Run:
- `pnpm lint`
- `node --test game/logic/fishing.test.ts`
- `node --test game/logic/shop.fishing-rods.test.ts`

Expected:
- lint passes
- both focused test files pass
