# Game Logic

Pure functions that process game state. The heart of the game engine.

## Files

| File | Purpose |
|------|---------|
| `tick.ts` | Main tick processor - runs every 100ms |
| `xp.ts` | XP gain and level-up calculations |
| `resources.ts` | Add/remove resources with cap handling |
| `offline.ts` | Process elapsed time when app resumes |
| `rng.ts` | Seeded random number generator |

## Core Function: processTick

```typescript
function processTick(state: GameState, deltaMs: number): TickResult {
  // 1. Calculate ticks elapsed
  // 2. Process active skill (if any)
  // 3. Process automated skills at 50% efficiency
  // 4. Advance RNG seed
  // 5. Return new state + events
}
```

## Events System

Tick processing returns events for UI feedback:
- `SKILL_ACTION` - XP/resources gained
- `SKILL_LEVEL_UP` - Level increased
- `PLAYER_LEVEL_UP` - Player level increased
- `AUTOMATION_UNLOCKED` - Skill can now be automated

## Seeded RNG

All randomness uses `rng.ts` with Mulberry32 algorithm:
```typescript
const rng = createRng(state.rngSeed);
const roll = rng(); // 0-1
```

This ensures deterministic replay for offline progress.

## Rules

1. Functions must be pure - no side effects
2. Never mutate input state - always return new objects
3. Use spread operator for immutable updates
4. Pass time as parameter, never call Date.now()
