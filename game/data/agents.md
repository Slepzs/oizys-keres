# Game Data

Static configuration, constants, and balance values. No logic here - just data.

## Files

| File | Purpose |
|------|---------|
| `constants.ts` | Tick rates, caps, timing values |
| `curves.ts` | XP formulas, scaling functions |
| `skills.data.ts` | Skill definitions and initial state factories |
| `resources.data.ts` | Resource definitions and initial state factories |
| `items.data.ts` | Item definitions and bag initial state |
| `skill-drops.data.ts` | Drop tables for each skill |
| `quests.data.ts` | Quest definitions and initial state |
| `achievements.data.ts` | Achievement definitions and initial state |

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

## Adding New Achievements

1. Add definition to `ACHIEVEMENT_DEFINITIONS` in `achievements.data.ts`:
```typescript
achievement_id: {
  id: 'achievement_id',
  name: 'Achievement Name',
  description: 'How to unlock',
  icon: '🏆',
  category: 'skill' | 'collection' | 'progression' | 'secret',
  condition: { type: 'skill_level', skillId: 'woodcutting', level: 10 },
  rewards: [{ type: 'multiplier', target: 'woodcutting', bonus: 0.05 }],
}
```

Achievement categories:
- `skill` - Skill milestones (level 10, 25, 50)
- `collection` - Item/resource gathering
- `progression` - Player level, quests completed
- `secret` - Hidden until unlocked

## Adding New Quests

1. Add definition to `QUEST_DEFINITIONS` in `quests.data.ts`
2. Define objectives, unlock conditions, and rewards
3. See `quests.data.ts` for examples
