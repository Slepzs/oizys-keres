---
applyTo: '**'
---

# Coding Preferences
- TypeScript with strict mode enabled
- Pure functions for game logic (no classes)
- Functional React components only
- Use `@/` path alias for imports
- Use pnpm as package manager

# Project Architecture
- `/game` - Pure game logic (no React dependencies)
- `/ui` - React UI layer
- `/app` - Expo Router routes only (thin wrappers)
- `/hooks` - Custom React hooks
- `/services` - Side effects (storage, etc.)
- Save system uses single JSON blob with version migrations

# Solutions Repository
- XP curves use polynomial scaling
- Tick-based game loop with deterministic offline progress
- Seeded RNG for reproducibility
- Bag/inventory system with 20 slots and item stacking
- Save migrations pattern: version bump in schema.ts, migration fn in migrations.ts
- When adding state: update GameState, initial-state.ts, deserialize.ts, gameStore.ts (partialize + rehydration), useGame.ts hooks
- Quest system: event-driven "quests as contracts" pattern
  - Definitions in /game/data/quests.data.ts (static data)
  - Logic in /game/logic/quests.ts (pure functions)
  - Progress tracked via tick events (SKILL_ACTION, SKILL_LEVEL_UP, ITEM_DROPPED)
  - processQuestEvents() called in store tick() after processTick()
  - Rewards applied via applyQuestRewards() on completion
  - Supports repeatables with cooldown tracking
- Bag improvements (v4 save schema):
  - SortMode type: 'rarity' | 'category' | 'quantity' | 'name'
  - BagSlot now has optional `locked` property
  - BagSettings in GameState: { autoSort, sortMode }
  - Pure functions: sortBag, consolidateStacks, expandBag, toggleSlotLock, discardSlot
  - ACTIONS_PAUSED_BAG_FULL event skips drops when bag is full (prevents item loss)
  - Store actions: sortBag, consolidateBag, toggleAutoSort, setSortMode, toggleSlotLock, expandBag, discardSlot
  - UI: Sort modal, Stack button, Auto toggle in BagScreen; Lock/Discard buttons in BagGrid; Lock icon in BagSlot
- Specs directory at .agents/specs/ for future feature documentation
