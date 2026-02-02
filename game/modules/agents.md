# Game Modules

This folder defines the **module registration layer** for the game.

It exists to make feature wiring scalable:
- The store boots the game once and calls `registerGameModules()`
- Each feature declares a `GameModule` with a `register()` function
- The central `registry.ts` controls the module list and ordering

## Philosophy

- **One place to wire features** (no scattering register calls across the store)
- **Idempotent registration** (safe to call multiple times)
- **Deterministic ordering** (module list order is stable; event handler order is still controlled by handler priority)

## Files

| File | Purpose |
|------|---------|
| `types.ts` | `GameModule` interface |
| `register.ts` | `registerGameModules()` function |
| `registry.ts` | `ALL_GAME_MODULES` list and ordering |
| `*/register.ts` | Per-feature module definitions |

## Usage

The store registers modules at module load:

```typescript
import { registerGameModules } from '@/game/modules';

registerGameModules();
```

## Adding a New Module (Checklist)

1. Create event handlers in `game/systems/` (ex: `systems/upgrade-handler.ts`)
2. Export `registerUpgradeHandlers()` from `game/systems/index.ts`
3. Create `game/modules/upgrades/register.ts`:

```typescript
import type { GameModule } from '../types';
import { registerUpgradeHandlers } from '../../systems';

export const upgradesModule: GameModule = {
  id: 'upgrades',
  register: () => {
    registerUpgradeHandlers();
  },
};
```

4. Add the module to `game/modules/registry.ts` (`ALL_GAME_MODULES`)

## Ordering Rules

- **Module order** (in `registry.ts`) is only for predictable initialization.
- **Event ordering** is controlled by `eventBus` handler priorities (lower runs first).
- If you have dependencies (ex: stats should see quest-updated state), enforce it via handler priority, not module order.

