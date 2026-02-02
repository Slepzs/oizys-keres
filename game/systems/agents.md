# Game Systems

Feature modules that organize related game mechanics.

## Current Systems

| System | Purpose |
|--------|---------|
| `skills/` | Skill definitions, registry, lookups |
| `events.ts` | Event bus for decoupling producers/consumers |
| `events.types.ts` | GameEvent union type definitions |
| `quest-handler.ts` | Quest event processing via event bus |
| `achievement-handler.ts` | Achievement event processing via event bus |

## Event Bus Architecture

The event bus decouples event producers (tick system) from consumers (quests, achievements, stats).

### Key Files

- `events.types.ts` - Defines `GameEvent` union type
- `events.ts` - `EventBus` class with priority-based dispatch
- `quest-handler.ts` - Registers quest handlers (priority 50)
- `achievement-handler.ts` - Registers achievement handlers (priority 100)

### Event Types

```typescript
type GameEvent =
  | { type: 'SKILL_ACTION'; skillId: SkillId; xpGained: number; resourceGained: number }
  | { type: 'SKILL_LEVEL_UP'; skillId: SkillId; newLevel: number }
  | { type: 'PLAYER_LEVEL_UP'; newLevel: number }
  | { type: 'AUTOMATION_UNLOCKED'; skillId: SkillId }
  | { type: 'ITEM_DROPPED'; skillId: SkillId; itemId: ItemId; quantity: number }
  | { type: 'BAG_FULL'; itemId: ItemId; quantity: number }
  | { type: 'ACTIONS_PAUSED_BAG_FULL' }
  | { type: 'QUEST_COMPLETED'; questId: string }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string };
```

### Usage

```typescript
// Register handler (lower priority = runs first)
eventBus.on('SKILL_LEVEL_UP', (event, state) => {
  return checkAchievements(state, event);
}, 100);

// Dispatch events (in gameStore tick action)
const finalState = eventBus.dispatch(result.events, result.state);
```

### Handler Priorities

- **50**: Quest handlers (process first)
- **100**: Achievement handlers (process after quests)

## Skills System

The `skills/` folder contains:
- `skill-registry.ts` - Lookup functions for skill definitions

```typescript
getSkillDefinition(skillId)    // Get single skill
getAllSkillDefinitions()       // Get all skills
isValidSkillId(id)            // Type guard
getAvailableSkills(level)     // Skills unlocked at player level
```

## Adding New Event Handlers

1. Create `systems/[name]-handler.ts`
2. Export `register[Name]Handlers()` function
3. Register handlers with `eventBus.on()`
4. Export from `systems/index.ts`
5. Call register function in `gameStore.ts`

## Pattern

Each system folder should have:
- `index.ts` - Barrel export
- Feature-specific files with pure functions
- No React imports
