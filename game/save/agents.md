# Save System

Handles persistence with versioning and migrations.

## Philosophy

Per project requirements:
- Save as **single JSON blob** (no normalized tables)
- **Version the save file** for future migrations
- **Always load older versions** via migration chain
- Client is source of truth, not backend

## Files

| File | Purpose |
|------|---------|
| `schema.ts` | `SaveBlob` type, current version constant |
| `initial-state.ts` | Factory for new game state |
| `serialize.ts` | `GameState` → JSON string |
| `deserialize.ts` | JSON string → `GameState` with validation |
| `migrations.ts` | Version upgrade functions |

## Current Version

**CURRENT_SAVE_VERSION = 5**

## Save Blob Structure

```typescript
interface SaveBlob {
  version: number;      // CURRENT_SAVE_VERSION
  savedAt: number;      // Timestamp
  state: GameState;     // Full game state
}
```

## Version History

| Version | Changes |
|---------|---------|
| 1 | Initial save format |
| 2 | Added `bag` (inventory system) |
| 3 | Added `quests` (quest system) |
| 4 | Added `bagSettings` (sort preferences) |
| 5 | Added `achievements` and `multipliers` |

## Migration Pattern

When save format changes:

1. Increment `CURRENT_SAVE_VERSION` in `schema.ts`
2. Add migration function in `migrations.ts`:

```typescript
const migrations: Record<number, MigrationFn> = {
  // v4 → v5: Add achievements and multipliers
  4: (save) => ({
    ...save,
    version: 5,
    state: {
      ...save.state,
      achievements: createInitialAchievementsState(),
      multipliers: createInitialMultipliersState(),
    },
  }),
};
```

3. Migrations chain automatically: v1 → v2 → v3 → v4 → v5 → current

## Validation

`deserialize.ts` includes `validateAndRepairState()` which:
- Fills missing fields with defaults
- Resets session timestamp
- Ensures valid state structure

This prevents crashes from corrupted/partial saves.

## Adding New State

When adding new state fields:

1. Update `GameState` in `types/state.ts`
2. Add initial factory in `initial-state.ts`
3. Add default in `validateAndRepairState()` in `deserialize.ts`
4. Add to `partialize` in `gameStore.ts`
5. Add to rehydration handler in `gameStore.ts`
6. Add selector hook in `gameStore.ts`
7. Bump `CURRENT_SAVE_VERSION` and add migration
