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
- Save migrations pattern: version bump in schema.ts (CURRENT_SAVE_VERSION), migration fn in migrations.ts
- When adding state: update GameState in types/state.ts, initial-state.ts, deserialize.ts, gameStore.ts (partialize + rehydration + selector hooks)
- Current save version: 5 (added achievements and multipliers)
- Event Bus Architecture:
  - /game/systems/events.ts - EventBus class for decoupling producers/consumers
  - /game/systems/events.types.ts - GameEvent union type (replaces TickEvent)
  - Handlers registered with priority (lower = runs first)
  - eventBus.dispatch() processes events through all registered handlers
  - Quest handlers at priority 50, achievement handlers at priority 100
- Quest system: event-driven "quests as contracts" pattern
  - Definitions in /game/data/quests.data.ts (static data)
  - Logic in /game/logic/quests.ts (pure functions)
  - Handler in /game/systems/quest-handler.ts (event bus subscriber)
  - Progress tracked via tick events (SKILL_ACTION, SKILL_LEVEL_UP, ITEM_DROPPED)
  - Rewards applied via applyQuestRewards() on completion
  - Supports repeatables with cooldown tracking
- Achievements system:
  - Definitions in /game/data/achievements.data.ts
  - Logic in /game/logic/achievements.ts (checkAchievements, evaluateAchievementCondition)
  - Handler in /game/systems/achievement-handler.ts
  - Conditions: skill_level, player_level, any_skill_level, quests_completed, etc.
  - Rewards: multipliers, resources, items, unlocks
- Multipliers system:
  - Types in /game/types/multipliers.ts (Multiplier, MultipliersState)
  - Logic in /game/logic/multipliers.ts (getEffectiveMultiplier, getSkillXpMultiplier)
  - Applied in tick.ts for XP and drop rate calculations
  - Sources: achievement, upgrade, equipment, perk
  - Types: additive (sum) and multiplicative (product)
- Bag improvements (v4 save schema):
  - SortMode type: 'rarity' | 'category' | 'quantity' | 'name'
  - BagSlot now has optional `locked` property
  - BagSettings in GameState: { autoSort, sortMode }
  - Pure functions: sortBag, consolidateStacks, expandBag, toggleSlotLock, discardSlot
  - ACTIONS_PAUSED_BAG_FULL event skips drops when bag is full (prevents item loss)
  - Store actions: sortBag, consolidateBag, toggleAutoSort, setSortMode, toggleSlotLock, expandBag, discardSlot
  - UI: Sort modal, Stack button, Auto toggle in BagScreen; Lock/Discard buttons in BagGrid; Lock icon in BagSlot
- Specs directory at .agents/specs/ for future feature documentation
