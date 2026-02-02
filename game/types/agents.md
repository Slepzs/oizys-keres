# Game Types

Core TypeScript interfaces for all game state.

## Files

| File | Contains |
|------|----------|
| `state.ts` | `GameState`, `PlayerState`, `TimestampsState`, `BagSettings`, `GameAction` |
| `skills.ts` | `SkillId`, `SkillState`, `SkillDefinition` |
| `resources.ts` | `ResourceId`, `ResourceState`, `ResourceDefinition` |
| `items.ts` | `ItemId`, `BagState`, `BagSlot`, `ItemDefinition`, `SortMode` |
| `quests.ts` | `QuestDefinition`, `QuestsState`, `PlayerQuestState`, `Objective` |
| `achievements.ts` | `AchievementDefinition`, `AchievementsState`, `AchievementCondition` |
| `multipliers.ts` | `Multiplier`, `MultipliersState`, `MultiplierSource`, `MultiplierTarget` |

## Key Types

### GameState
The root state object. Everything the game needs is here:
- `player` - Level, XP
- `skills` - All skill states
- `resources` - All resource amounts
- `bag` - Inventory slots
- `bagSettings` - Auto-sort preferences
- `quests` - Active/completed quests
- `achievements` - Unlocked achievements
- `multipliers` - Active bonuses
- `timestamps` - Session tracking
- `activeSkill` - Currently training
- `rngSeed` - For deterministic randomness

### Achievements Types
```typescript
interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'collection' | 'progression' | 'secret';
  condition: AchievementCondition;
  rewards?: AchievementReward[];
}

type AchievementCondition =
  | { type: 'skill_level'; skillId: SkillId; level: number }
  | { type: 'any_skill_level'; level: number }
  | { type: 'player_level'; level: number }
  | { type: 'quests_completed'; count: number }
  // ... more conditions
```

### Multipliers Types
```typescript
interface Multiplier {
  id: string;
  source: 'achievement' | 'upgrade' | 'equipment' | 'perk';
  target: SkillId | 'all_skills' | 'xp' | 'drops';
  type: 'additive' | 'multiplicative';
  value: number;  // 0.05 = +5% additive, 1.5 = 1.5x multiplicative
}
```

### SkillId / ResourceId
Union types of valid IDs. When adding new skills/resources:
1. Add to the union type here
2. Add definition in `data/skills.data.ts` or `data/resources.data.ts`

### GameAction
Discriminated union for all state mutations.

## Adding New Types

1. Create interface in appropriate file
2. Export from `index.ts`
3. Types flow up through `@/game` barrel export
