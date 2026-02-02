# Game Logic

Pure functions that process game state. The heart of the game engine.

## Files

| File | Purpose |
|------|---------|
| `tick.ts` | Main tick processor - runs every 100ms |
| `skills/tick.ts` | Skill processing + drops (active + automation) |
| `combat/tick.ts` | Combat catch-up processing (time-based) |
| `combat/commands.ts` | Combat state transitions (start/flee/equip/etc.) |
| `combat/queries.ts` | Combat derived stats (levels, DPS, etc.) |
| `xp.ts` | XP gain and level-up calculations |
| `resources.ts` | Add/remove resources with cap handling |
| `offline.ts` | Process elapsed time when app resumes |
| `rng.ts` | Seeded random number generator |
| `bag.ts` | Inventory management (add/remove items, sorting) |
| `quests/commands.ts` | Quest state transitions (start/abandon/claim rewards) |
| `quests/queries.ts` | Quest availability/progress (cooldowns, completion, etc.) |
| `achievements/commands.ts` | Achievement progression + unlock rewards |
| `achievements/queries.ts` | Achievement conditions + listing helpers |
| `multipliers.ts` | Bonus calculation from achievements/upgrades |

## Core Function: processTick

```typescript
function processTick(state: GameState, deltaMs: number, ctx: GameContext): TickResult {
  // 1. Calculate ticks elapsed
  // 2. Process active skill (if any)
  // 3. Process automated skills at 50% efficiency
  // 4. Apply multipliers to XP and drop rates
  // 5. Advance RNG seed
  // 6. Return new state + events
}
```

## Multipliers System

Multipliers affect XP and drop rate calculations in `tick.ts`:

```typescript
// In processSkillTick:
const xpMultiplier = getSkillXpMultiplier(state, skillId);
const xpGained = Math.floor(base * actionsCompleted * xpMultiplier);

// In processSkillDrops:
const dropMultiplier = getEffectiveMultiplier(state, 'drops');
const effectiveChance = Math.min(1, drop.chance * dropMultiplier);
```

Key functions in `multipliers.ts`:
- `getEffectiveMultiplier(state, target)` - Get combined multiplier for target
- `getSkillXpMultiplier(state, skillId)` - XP multiplier including global bonuses
- `addMultiplier(state, multiplier)` - Add or update a multiplier
- `removeMultiplier(state, multiplierId)` - Remove a multiplier

## Achievements System

Achievements are checked via event bus after game events:

```typescript
// In achievements.ts:
checkAchievements(state, event, ctx)  // Check all unlockable achievements
evaluateAchievementCondition(condition, state)  // Test single condition
unlockAchievement(state, definition, ctx)  // Unlock and apply rewards
```

Achievement conditions include:
- `skill_level` - Specific skill at level
- `any_skill_level` - Any skill at level
- `player_level` - Player level
- `quests_completed` - Total quest completions

## Events System

Tick processing returns events consumed by the event bus:
- `SKILL_ACTION` - XP/resources gained
- `SKILL_LEVEL_UP` - Level increased
- `PLAYER_LEVEL_UP` - Player level increased
- `AUTOMATION_UNLOCKED` - Skill can now be automated
- `ITEM_DROPPED` - Item added to bag
- `BAG_FULL` - Item couldn't be added
- `QUEST_COMPLETED` - Quest objectives met
- `ACHIEVEMENT_UNLOCKED` - Achievement unlocked

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
