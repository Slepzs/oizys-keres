# Game Data

Static configuration, constants, and balance values. No logic here - just data.

## Files

| File | Purpose |
|------|---------|
| `constants.ts` | Tick rates, caps, timing values |
| `curves.ts` | XP formulas, scaling functions |
| `skills.data.ts` | Skill definitions and initial state factories |
| `resources.data.ts` | Resource definitions and initial state factories |

## Key Constants

```typescript
TICK_RATE_MS = 100        // 10 ticks per second
AUTO_SAVE_INTERVAL_MS = 30_000
MAX_OFFLINE_MS = 24 * 60 * 60 * 1000  // 24 hours
MAX_SKILL_LEVEL = 99
```

## XP Curves

Skill XP uses polynomial scaling: `base * level^1.5`
Player XP uses steeper scaling: `base * level^2`

To adjust progression speed, modify exponents in `curves.ts`.

## Adding New Skills

1. Add `SkillId` to union in `types/skills.ts`
2. Add definition to `SKILL_DEFINITIONS` in `skills.data.ts`
3. Add to `createInitialSkillsState()` factory

## Adding New Resources

1. Add `ResourceId` to union in `types/resources.ts`
2. Add definition to `RESOURCE_DEFINITIONS` in `resources.data.ts`
3. Add to `createInitialResourcesState()` factory
