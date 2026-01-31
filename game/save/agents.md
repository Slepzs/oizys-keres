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

## Save Blob Structure

```typescript
interface SaveBlob {
  version: number;      // CURRENT_SAVE_VERSION
  savedAt: number;      // Timestamp
  state: GameState;     // Full game state
}
```

## Migration Pattern

When save format changes:

1. Increment `CURRENT_SAVE_VERSION` in `schema.ts`
2. Add migration function in `migrations.ts`:

```typescript
const migrations: Record<number, MigrationFn> = {
  1: (save) => ({
    ...save,
    version: 2,
    state: {
      ...save.state,
      newField: 'default',
    },
  }),
};
```

3. Migrations chain automatically: v1 → v2 → v3 → current

## Validation

`deserialize.ts` includes `validateAndRepairState()` which:
- Fills missing fields with defaults
- Resets session timestamp
- Ensures valid state structure

This prevents crashes from corrupted/partial saves.
