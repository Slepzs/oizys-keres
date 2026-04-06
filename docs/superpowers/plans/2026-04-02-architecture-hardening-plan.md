# Architecture Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce architectural brittleness so new idle-RPG systems can be added without spreading rules across UI, store, save, and engine layers.

**Architecture:** Keep the current top-level structure (`app`, `game`, `store`, `ui`, `services`) and harden the seams inside it. The main refactor is to make `game` the only home for gameplay rules, keep `store` as orchestration plus derived read-models, split oversized screen/data files by feature, and remove legacy access paths that no longer match the actual app lifecycle.

**Tech Stack:** Expo Router, React Native, TypeScript, Zustand, MMKV, pure game logic in `game/*`

---

## Target File Structure

The refactor should preserve the current top-level layout and only split the pressure points.

### Existing Top-Level Folders To Keep

- `app/` for Expo Router route wrappers only
- `game/` for pure engine state, logic, data, save, modules, systems
- `store/` for Zustand orchestration and derived selectors
- `ui/` for screens, components, providers
- `services/` for MMKV and future I/O

### New Internal Structure To Introduce

- `game/logic/skills/commands.ts`
- `game/logic/skills/queries.ts`
- `store/derived/player.ts`
- `store/derived/skills.ts`
- `store/derived/combat.ts`
- `store/derived/progression.ts`
- `ui/screens/crafting/CraftingScreen.tsx`
- `ui/screens/crafting/CraftingSummarySection.tsx`
- `ui/screens/crafting/CraftingGoalsSection.tsx`
- `ui/screens/crafting/CraftingRecipeSection.tsx`
- `ui/screens/skill-detail/SkillDetailScreen.tsx`
- `ui/screens/skill-detail/SkillDetailHeader.tsx`
- `ui/screens/skill-detail/SkillDetailActionsSection.tsx`
- `ui/screens/skill-detail/SkillDetailSelectionSection.tsx`
- `game/data/quests/index.ts`
- `game/data/quests/skill-quests.ts`
- `game/data/quests/combat-quests.ts`
- `game/data/quests/progression-quests.ts`
- `game/data/items/index.ts`
- `game/data/items/materials.ts`
- `game/data/items/consumables.ts`
- `game/data/items/equipment.ts`
- `game/data/crafting/index.ts`
- `game/data/crafting/categories.ts`
- `game/data/crafting/infrastructure.ts`
- `game/data/crafting/recipes.ts`

Compatibility barrels can remain in place during the transition:

- `store/selectors.ts`
- `game/data/quests.data.ts`
- `game/data/items.data.ts`
- `game/data/crafting.data.ts`

Those files should become thin re-export files once the new structure is in place.

## Guardrails

- Do not add new top-level folders.
- Do not change the single-blob save-file strategy.
- Do not move game rules into React components or Zustand slices.
- Do not break the current public imports from `@/game/data`, `@/store`, or `@/ui/screens` until all callers are migrated.
- Prefer compatibility barrels during the refactor so routing and screen imports stay stable.

---

### Task 1: Remove Legacy State/Lifecycle Paths

**Files:**
- Modify: `hooks/useGame.ts`
- Modify: `hooks/useOfflineProgress.ts`
- Modify: `hooks/index.ts`
- Modify: `ui/screens/DashboardScreen.tsx`
- Modify: `ui/screens/SettingsScreen.tsx`
- Modify: `ui/agents.md`
- Modify: `hooks/agents.md`

- [ ] **Step 1: Audit current usage of legacy hooks**

Run: `rg -n "useGame\\(|useOfflineProgress\\(" ui app hooks`
Expected: direct matches only in legacy hook files plus the small number of screens still depending on them.

- [ ] **Step 2: Replace remaining `useGame()` screen reads with direct store selectors or dedicated selectors**

Use `useOfflineSummary`, `usePlayerSummary`, or direct `useGameStore(...)` selectors in the remaining UI callers so screen code matches the real Zustand architecture.

- [ ] **Step 3: Remove duplicate offline-progress lifecycle behavior from `hooks/useOfflineProgress.ts`**

Make the store boot path plus `TickManager` the only offline-progress mechanism. The hook should either be deleted or reduced to a thin read-only helper over store state.

- [ ] **Step 4: Reduce `hooks/useGame.ts` to a temporary compatibility shim or remove it entirely**

If any external call sites remain, make `useGame()` a thin deprecated wrapper over stable selectors. If there are no remaining call sites, delete it and stop exporting it.

- [ ] **Step 5: Update local architecture docs so they describe Zustand selectors and store-managed offline progress accurately**

Fix outdated guidance in `ui/agents.md` and `hooks/agents.md` so future work does not reintroduce the old pattern.

- [ ] **Step 6: Verify the legacy path is gone**

Run: `rg -n "useGame\\(|useOfflineProgress\\(" ui app hooks`
Expected: no remaining UI call sites outside intentionally deprecated compatibility files.

- [ ] **Step 7: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 8: Commit**

```bash
git add hooks/useGame.ts hooks/useOfflineProgress.ts hooks/index.ts ui/screens/DashboardScreen.tsx ui/screens/SettingsScreen.tsx ui/agents.md hooks/agents.md
git commit -m "refactor: remove legacy game state access paths"
```

---

### Task 2: Move Store-Side Gameplay Rules Back Into `game/logic`

**Files:**
- Create: `game/logic/skills/commands.ts`
- Create: `game/logic/skills/queries.ts`
- Modify: `game/logic/index.ts`
- Modify: `store/slices/skillsSlice.ts`
- Modify: `store/slices/combatSlice.ts`
- Modify: `store/slices/craftingSlice.ts`

- [ ] **Step 1: Audit which store slices currently enforce gameplay rules**

Run: `rg -n "levelRequired|automationUnlocked|activeCombat|requiredRod|herbloreLevelRequired|cookingLevelRequired" store/slices`
Expected: matches mainly in `skillsSlice.ts`, with any other domain rules surfaced for extraction.

- [ ] **Step 2: Add pure skill-selection command helpers in `game/logic/skills/commands.ts`**

Move validations such as active tree selection, active rock selection, fishing spot selection, and recipe selection into pure functions of `(state, input) => nextState`.

- [ ] **Step 3: Add read-only helpers in `game/logic/skills/queries.ts`**

Expose reusable checks like `canSelectTree`, `canSelectRock`, `canSelectFishingSpot`, `canSelectCookingRecipe`, and `canSelectHerbloreRecipe`.

- [ ] **Step 4: Refactor `store/slices/skillsSlice.ts` to become orchestration only**

The slice should fetch state, call the pure command, and `set(...)` the result. It should stop knowing feature rules directly.

- [ ] **Step 5: Repeat the same pattern for any combat/crafting rules found in other slices**

If a slice is deciding what is unlocked, valid, or allowed, move that logic into `game/logic` before leaving the task.

- [ ] **Step 6: Verify rules now live in `game/logic` instead of the store**

Run: `rg -n "levelRequired|requiredRod|automationUnlocked" store/slices`
Expected: only trivial guard usage remains; rule-heavy branching has moved to `game/logic`.

- [ ] **Step 7: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 8: Commit**

```bash
git add game/logic/index.ts game/logic/skills/commands.ts game/logic/skills/queries.ts store/slices/skillsSlice.ts store/slices/combatSlice.ts store/slices/craftingSlice.ts
git commit -m "refactor: move gameplay rules out of zustand slices"
```

---

### Task 3: Split Derived Store Selectors By Domain

**Files:**
- Create: `store/derived/player.ts`
- Create: `store/derived/skills.ts`
- Create: `store/derived/combat.ts`
- Create: `store/derived/progression.ts`
- Modify: `store/selectors.ts`
- Modify: `store/index.ts`

- [ ] **Step 1: Group existing selectors by responsibility**

Use these buckets:
- player/vitals/session
- skills/resources/automation summaries
- combat/equipment/projections
- progression/completion/multipliers/quests

- [ ] **Step 2: Move selector implementations into `store/derived/*.ts` files**

Keep the existing selector names and exported signatures stable while reducing file size and feature coupling.

- [ ] **Step 3: Convert `store/selectors.ts` into a compatibility barrel**

Re-export from the new domain files so existing imports from `@/store` continue to work during the refactor.

- [ ] **Step 4: Keep `useShallow` and `useMemo` patterns intact**

Do not move derived object construction back inside Zustand selectors. Preserve the current anti-infinite-loop pattern.

- [ ] **Step 5: Verify public selector API stability**

Run: `rg -n "from '@/store'" ui app hooks store`
Expected: no caller changes should be necessary if the barrel remains stable.

- [ ] **Step 6: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 7: Commit**

```bash
git add store/derived/player.ts store/derived/skills.ts store/derived/combat.ts store/derived/progression.ts store/selectors.ts store/index.ts
git commit -m "refactor: split derived store selectors by domain"
```

---

### Task 4: Split The Heaviest Screens By Feature

**Files:**
- Create: `ui/screens/crafting/CraftingScreen.tsx`
- Create: `ui/screens/crafting/CraftingSummarySection.tsx`
- Create: `ui/screens/crafting/CraftingGoalsSection.tsx`
- Create: `ui/screens/crafting/CraftingRecipeSection.tsx`
- Create: `ui/screens/skill-detail/SkillDetailScreen.tsx`
- Create: `ui/screens/skill-detail/SkillDetailHeader.tsx`
- Create: `ui/screens/skill-detail/SkillDetailActionsSection.tsx`
- Create: `ui/screens/skill-detail/SkillDetailSelectionSection.tsx`
- Modify: `ui/screens/CraftingScreen.tsx`
- Modify: `ui/screens/SkillDetailScreen.tsx`
- Modify: `ui/screens/index.ts`

- [ ] **Step 1: Move `CraftingScreen` into a feature folder without changing route exports**

Create the new `ui/screens/crafting/` folder, move implementation there, and leave `ui/screens/CraftingScreen.tsx` as a compatibility re-export until callers are cleaned up.

- [ ] **Step 2: Extract the crafting screen into 2-3 focused sections**

Use sections for:
- summary / automation status
- upcoming goals / blockers
- recipe list and action controls

- [ ] **Step 3: Move `SkillDetailScreen` into its own feature folder**

Create the new `ui/screens/skill-detail/` folder and keep the old file as a re-export during migration.

- [ ] **Step 4: Extract focused subcomponents from `SkillDetailScreen`**

Use separate files for:
- header and navigation chrome
- action and automation controls
- selection controls for trees, rocks, fishing spots, recipes, and pets

- [ ] **Step 5: Keep routing and screen barrel exports stable**

`app/skill/[skillId].tsx` and any `@/ui/screens` imports should continue to work during and after the split.

- [ ] **Step 6: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 7: Commit**

```bash
git add ui/screens/crafting ui/screens/skill-detail ui/screens/CraftingScreen.tsx ui/screens/SkillDetailScreen.tsx ui/screens/index.ts
git commit -m "refactor: split large screens into feature folders"
```

---

### Task 5: Split Oversized Data Files Without Breaking Imports

**Files:**
- Create: `game/data/quests/index.ts`
- Create: `game/data/quests/skill-quests.ts`
- Create: `game/data/quests/combat-quests.ts`
- Create: `game/data/quests/progression-quests.ts`
- Create: `game/data/items/index.ts`
- Create: `game/data/items/materials.ts`
- Create: `game/data/items/consumables.ts`
- Create: `game/data/items/equipment.ts`
- Create: `game/data/crafting/index.ts`
- Create: `game/data/crafting/categories.ts`
- Create: `game/data/crafting/infrastructure.ts`
- Create: `game/data/crafting/recipes.ts`
- Modify: `game/data/quests.data.ts`
- Modify: `game/data/items.data.ts`
- Modify: `game/data/crafting.data.ts`
- Modify: `game/data/index.ts`

- [ ] **Step 1: Split `quests.data.ts` by quest family**

Group quest definitions into domain-focused files such as skill quests, combat quests, and progression quests. Keep one assembler that exports the combined definitions and IDs.

- [ ] **Step 2: Split `items.data.ts` by item family**

Separate materials, consumables, and equipment while keeping one authoritative assembled item-definition map.

- [ ] **Step 3: Split `crafting.data.ts` by concern**

Separate categories, infrastructure definitions, and recipe definitions so future crafting additions do not happen in one monolith.

- [ ] **Step 4: Convert old `*.data.ts` files into thin compatibility barrels**

Existing imports from `@/game/data` should remain valid while internal structure gets smaller and clearer.

- [ ] **Step 5: Verify there is still only one public source of truth per domain**

Run: `rg -n "QUEST_DEFINITIONS|ITEM_DEFINITIONS|CRAFTING_RECIPES|INFRASTRUCTURE_DEFINITIONS" game ui store`
Expected: one assembled export per domain, not duplicated competing maps.

- [ ] **Step 6: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 7: Commit**

```bash
git add game/data/quests game/data/items game/data/crafting game/data/quests.data.ts game/data/items.data.ts game/data/crafting.data.ts game/data/index.ts
git commit -m "refactor: split oversized game data files"
```

---

### Task 6: Align Save/Architecture Docs With Reality

**Files:**
- Modify: `agents.md`
- Modify: `game/agents.md`
- Modify: `game/save/agents.md`
- Modify: `store/agents.md`
- Modify: `ui/agents.md`

- [ ] **Step 1: Audit stale documentation against the current codebase**

Run: `rg -n "CURRENT_SAVE_VERSION|GameProvider|useGame\\(|validateAndRepairState|partialize" agents.md game store ui hooks`
Expected: stale references will show up immediately, especially around save versioning and old Context-era architecture.

- [ ] **Step 2: Update save docs to match the real save system**

Correct the save version history and the actual deserialize/repair flow so contributors stop following outdated instructions.

- [ ] **Step 3: Update UI/store docs to match the real Zustand selector architecture**

Document:
- store boot-time offline processing
- `TickManager` as the sole foreground/background lifecycle bridge
- direct selector usage instead of legacy `useGame()`

- [ ] **Step 4: Add a short architectural rule section to the root `agents.md`**

Capture the intended layering:
- `game` owns rules
- `store` orchestrates
- `ui` renders and dispatches
- `services` own I/O

- [ ] **Step 5: Run verification**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both commands exit successfully.

- [ ] **Step 6: Commit**

```bash
git add agents.md game/agents.md game/save/agents.md store/agents.md ui/agents.md
git commit -m "docs: align architecture guidance with current code"
```

---

## Execution Notes

- Execute this plan in a dedicated worktree so the refactor can move files safely.
- Do not combine Tasks 1-5 into one commit. The point is to keep each seam change reviewable.
- If a task uncovers a missing automated test harness, do not invent one inside this refactor. Keep verification to `tsc`, `lint`, and any already-runnable targeted checks.
- If public import churn grows too large, leave compatibility barrels in place and defer import cleanup to a follow-up plan.

## Success Criteria

- Adding a new skill/system no longer requires encoding feature rules inside Zustand slices.
- New derived read-models have an obvious home under `store/derived/`.
- The heaviest screens no longer force feature work into 700-line files.
- `game/data` can grow by domain without turning into single-file registries.
- Architecture docs match the actual code, not the old Context-era structure.
