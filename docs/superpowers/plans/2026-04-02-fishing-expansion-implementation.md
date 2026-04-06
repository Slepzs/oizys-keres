# Fishing Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand fishing into a route-based system with richer spot metadata, deterministic catch tables, late-game rod/spot progression, and persistent fishing upgrade/rare-fish state.

**Architecture:** Keep balance and definitions in `game/data`, keep state mutation and reward resolution in pure `game/logic`, and treat save compatibility as a first-class requirement via migration plus deserialize repair. Preserve the current fishing UI flow while enriching selectors and cards with the new route metadata instead of adding a separate management screen.

**Tech Stack:** TypeScript, React Native, Zustand, Node `node:test`

---

### Task 1: Extend Fishing Domain State

**Files:**
- Modify: `game/types/skills.ts`
- Modify: `game/types/state.ts`
- Modify: `game/data/fishing-rods.data.ts`
- Modify: `game/data/shop.data.ts`
- Modify: `game/types/shop.ts`
- Modify: `game/save/schema.ts`
- Modify: `game/save/migrations.ts`
- Modify: `game/save/deserialize.ts`
- Test: `game/logic/fishing.test.ts`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run targeted tests to verify the failures are about missing fishing expansion behavior**
- [ ] **Step 3: Add new fishing IDs/state defaults and migration/repair support**
- [ ] **Step 4: Re-run targeted tests to confirm the domain state passes**

### Task 2: Implement Deterministic Fishing Catch Resolution

**Files:**
- Modify: `game/data/fishing-spots.data.ts`
- Create: `game/data/fishing-upgrades.data.ts`
- Create: `game/data/rare-fish.data.ts`
- Modify: `game/data/resources.data.ts`
- Modify: `game/data/items.data.ts`
- Modify: `game/logic/fishing.ts`
- Modify: `game/logic/skills/tick.ts`
- Modify: `game/logic/multipliers.ts`
- Modify: `game/systems/events.types.ts`
- Test: `game/logic/fishing.test.ts`

- [ ] **Step 1: Write failing deterministic reward-resolution tests**
- [ ] **Step 2: Run targeted tests to verify the new reward expectations fail**
- [ ] **Step 3: Implement pure catch-table and rare-fish reward resolution**
- [ ] **Step 4: Re-run targeted tests to confirm deterministic fishing rewards pass**

### Task 3: Surface Route Identity In Existing Fishing UI

**Files:**
- Modify: `store/selectors.ts`
- Modify: `ui/components/game/FishingSpotSelector.tsx`
- Modify: `ui/screens/SkillDetailScreen.tsx`
- Test: `ui/screens/skill-detail.config.test.ts`

- [ ] **Step 1: Write failing selector/UI tests where practical**
- [ ] **Step 2: Update selectors to expose route role, previews, and rare-fish progress safely**
- [ ] **Step 3: Update existing fishing detail UI without creating a new screen**
- [ ] **Step 4: Run targeted UI tests plus lint/type checks for touched files**
