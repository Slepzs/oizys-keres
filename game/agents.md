# Game Module

This is the **pure game logic layer** - it has zero React dependencies and can be tested/run independently.

## Philosophy

- All functions are **pure**: `(state, input) => newState`
- No side effects, no async, no I/O
- Deterministic: same inputs always produce same outputs
- This enables offline progress calculation and easy testing

## Subfolders

| Folder | Purpose |
|--------|---------|
| `types/` | TypeScript interfaces for all game state |
| `data/` | Static configs, constants, XP curves |
| `logic/` | Pure functions for game mechanics |
| `save/` | Serialization, versioning, migrations |
| `systems/` | Feature modules (skills, future: combat, automation) |

## Key Patterns

### State Shape
```typescript
interface GameState {
  player: { level, xp }
  skills: Record<SkillId, SkillState>
  resources: Record<ResourceId, ResourceState>
  timestamps: { lastActive, lastSave, sessionStart }
  activeSkill: SkillId | null
  rngSeed: number
}
```

### Tick Processing
The game runs on ticks (10/sec). The core function is:
```typescript
processTick(state: GameState, deltaMs: number): { state: GameState, events: TickEvent[] }
```

### Offline Progress
When app resumes, we calculate elapsed time and process ticks in chunks:
```typescript
processOfflineProgress(state, currentTime): OfflineProgressResult
```

## Import Pattern
Use the barrel export:
```typescript
import { GameState, processTick, SKILL_DEFINITIONS } from '@/game';
```

## Rules for This Folder

1. **Never import React** - this must stay pure
2. **Never use Date.now()** in logic - pass timestamps as parameters
3. **Never use Math.random()** - use seeded RNG from `logic/rng.ts`
4. **All game balance values** go in `data/` folder
5. **New features** get their own folder in `systems/`
