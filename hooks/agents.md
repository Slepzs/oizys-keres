# Hooks

Custom React hooks for game functionality.

## Hooks

| Hook | Purpose |
|------|---------|
| `useGame` | Access game state and actions (Zustand selectors) |
| `useGameTick` | Subscribe to tick-synchronized updates |
| `useSave` | Manual save/load, reset (auto-save via Zustand persist) |
| `useOfflineProgress` | Handle app foreground with progress summary |

## useGame

Primary hook for components. Uses Zustand selectors internally but maintains the same API:

```typescript
{
  state: GameState,
  dispatch: Dispatch<GameAction>,  // Legacy compatibility
  setActiveSkill: (id: SkillId | null) => void,
  toggleAutomation: (id: SkillId) => void,
  isLoaded: boolean,
}
```

Also provides convenience variants:
- `useGameState()` - Just the state (selector-based)
- `useGameActions()` - Just the actions (stable references)

### Direct Store Access

For better performance, use Zustand selectors directly:

```typescript
import { useGameStore, usePlayer, useSkills } from '@/store';

// Granular subscriptions = fewer re-renders
const player = usePlayer();
const skills = useSkills();

// Custom selector
const woodcuttingLevel = useGameStore((s) => s.skills.woodcutting.level);
```

## useSave

Handles manual save operations. Auto-save is handled by Zustand persist middleware.

```typescript
const { save, load, reset, isLoaded } = useSave();

save();   // Manual save to MMKV (sync)
load();   // Load from manual save slot
reset();  // Clear storage + reset state
```

### Auto-Save Behavior

Zustand persist middleware automatically saves state to MMKV on every change. No manual interval needed.

## useOfflineProgress

Listens for app state changes. When app returns to foreground:
1. Calculates elapsed time
2. Processes offline ticks
3. Sets `showSummary` if > 1 minute passed

```typescript
const { lastSummary, showSummary, dismissSummary } = useOfflineProgress();
```

Note: Initial offline progress on app launch is handled by the Zustand store's `onRehydrateStorage` callback.

## useGameTick

For components needing tick-synchronized updates:

```typescript
const state = useGameTick((deltaMs) => {
  // Called every tick (100ms)
});
```

Note: Main tick loop runs in `TickManager` component, not this hook.

## Rules

1. Prefer direct Zustand selectors over `useGame()` for performance
2. Side effects (storage, timers) belong in hooks, not components
3. Keep hooks focused on single responsibility
4. Legacy `dispatch` is provided for compatibility but prefer direct actions
