# Store

Zustand store for game state management.

## Philosophy

- **Single source of truth** for game state
- **Zustand** over Context for simpler API and selector-based subscriptions
- **MMKV persistence** via Zustand persist middleware
- **Offline progress** processed on rehydration

## Files

| File | Purpose |
|------|---------|
| `gameStore.ts` | Main store with state, actions, and persistence |
| `index.ts` | Public exports |

## Store Structure

```typescript
type GameStore = GameState & GameActions & HydrationState;

// State (from game/types)
interface GameState {
  player: PlayerState;
  skills: SkillsState;
  resources: ResourcesState;
  timestamps: TimestampsState;
  activeSkill: string | null;
  rngSeed: number;
}

// Actions
interface GameActions {
  tick: (deltaMs: number) => void;
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  loadSave: (state: GameState) => void;
  reset: () => void;
}

// Hydration tracking
interface HydrationState {
  isHydrated: boolean;
}
```

## Selector Hooks

Pre-built selectors for common use cases:

```typescript
import { usePlayer, useSkills, useResources, useActiveSkill, useIsHydrated } from '@/store';

const player = usePlayer();           // Just player state
const skills = useSkills();           // Just skills state
const activeSkill = useActiveSkill(); // Currently training skill
const isHydrated = useIsHydrated();   // Store loaded from MMKV?
```

## Custom Selectors

For granular subscriptions (fewer re-renders):

```typescript
import { useGameStore } from '@/store';

// Only re-renders when woodcutting level changes
const level = useGameStore((s) => s.skills.woodcutting.level);

// Multiple values (shallow comparison)
const { level, xp } = useGameStore(
  (s) => ({ level: s.skills.woodcutting.level, xp: s.skills.woodcutting.xp }),
  shallow
);
```

## Actions

Access actions without subscribing to state:

```typescript
import { useGameStore } from '@/store';

// In component
const setActiveSkill = useGameStore((s) => s.setActiveSkill);
setActiveSkill('woodcutting');

// Outside React
useGameStore.getState().setActiveSkill('woodcutting');
```

## Persistence

Handled automatically by Zustand persist middleware:

```typescript
persist(storeConfig, {
  name: 'game-storage',
  storage: createJSONStorage(() => zustandStorage), // MMKV adapter
  partialize: (state) => ({
    // Only persist game state, not actions or hydration flag
    player, skills, resources, timestamps, activeSkill, rngSeed
  }),
  onRehydrateStorage: () => (state) => {
    // Process offline progress here
    // Mark isHydrated = true when done
  },
})
```

### What Gets Persisted

| Persisted | Not Persisted |
|-----------|---------------|
| player | actions (tick, etc.) |
| skills | isHydrated |
| resources | |
| timestamps | |
| activeSkill | |
| rngSeed | |

## Offline Progress

Processed in `onRehydrateStorage` callback:

1. Store rehydrates from MMKV
2. Calculate elapsed time since `timestamps.lastActive`
3. Call `processOfflineProgress()` from game logic
4. Update store with new state
5. Set `isHydrated = true`

## Usage Patterns

### In Components

```typescript
// Prefer granular selectors
const level = useGameStore((s) => s.player.level);

// Or pre-built hooks
const player = usePlayer();
```

### In Hooks

```typescript
// Can access full store
const state = useGameStore.getState();
const { tick, setActiveSkill } = state;
```

### Outside React

```typescript
// Direct store access
useGameStore.getState().reset();
useGameStore.setState({ activeSkill: null });
```

## Rules

1. Use selectors for minimal re-renders
2. Actions are stable references (no useCallback needed)
3. Don't mutate state directly - use actions
4. Game logic stays pure in `/game` - store just orchestrates
