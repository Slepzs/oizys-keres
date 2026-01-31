# Game Types

Core TypeScript interfaces for all game state.

## Files

| File | Contains |
|------|----------|
| `state.ts` | `GameState`, `PlayerState`, `TimestampsState`, `GameAction` |
| `skills.ts` | `SkillId`, `SkillState`, `SkillDefinition` |
| `resources.ts` | `ResourceId`, `ResourceState`, `ResourceDefinition` |

## Key Types

### GameState
The root state object. Everything the game needs is here.

### SkillId / ResourceId
Union types of valid IDs. When adding new skills/resources:
1. Add to the union type here
2. Add definition in `data/skills.data.ts` or `data/resources.data.ts`

### GameAction
Discriminated union for all state mutations. Used by the reducer in `GameProvider`.

## Adding New Types

1. Create interface in appropriate file
2. Export from `index.ts`
3. Types flow up through `@/game` barrel export
