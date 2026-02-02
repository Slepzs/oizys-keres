# Store

Zustand store for game state management.

## Philosophy

- **Single source of truth** for game state
- **Zustand** over Context for simpler API and selector-based subscriptions
- **MMKV persistence** as versioned `SaveBlob` JSON (single blob)
- **Offline progress** applied on app resume and cold start

## Files

| File | Purpose |
|------|---------|
| `gameStore.ts` | Main store with state, actions, and persistence |
| `index.ts` | Public exports |

## Event Bus Integration

Event handlers are registered at module load:

```typescript
import { eventBus, registerQuestHandlers, registerAchievementHandlers } from '@/game/systems';

// Register event handlers once at module load
registerQuestHandlers();      // Priority 50
registerAchievementHandlers(); // Priority 100
```

The tick action dispatches events through the event bus (with a `GameContext` containing `now`):

```typescript
tick: (deltaMs: number, now: number) => {
  const result = processTick(state, deltaMs, { now });
  const finalState = eventBus.dispatch(result.events, result.state, { now });
  set({ ...finalState, timestamps: { ...finalState.timestamps, lastActive: now } });
}
```

## Store Structure

```typescript
type GameStore = GameState & GameActions & HydrationState;

// State (from game/types)
interface GameState {
  player: PlayerState;
  skills: SkillsState;
  resources: ResourcesState;
  bag: BagState;
  bagSettings: BagSettings;
  quests: QuestsState;
  achievements: AchievementsState;
  multipliers: MultipliersState;
  timestamps: TimestampsState;
  activeSkill: string | null;
  rngSeed: number;
}

// Actions
interface GameActions {
  tick: (deltaMs: number, now: number) => void;
  applyOfflineProgress: (now: number) => void;
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  addItem / removeItem / discardSlot: // Bag management
  sortBag / consolidateBag: // Bag organization
  startQuest / abandonQuest / claimQuestRewards: // Quest management
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
import {
  usePlayer,
  useSkills,
  useResources,
  useBag,
  useBagSettings,
  useQuests,
  useAchievements,
  useMultipliers,
  useActiveSkill,
  useIsHydrated
} from '@/store';

const player = usePlayer();             // Just player state
const skills = useSkills();             // Just skills state
const resources = useResources();       // Just resources state
const bag = useBag();                   // Inventory state
const bagSettings = useBagSettings();   // Sort preferences
const quests = useQuests();             // Quest progress
const achievements = useAchievements(); // Unlocked achievements
const multipliers = useMultipliers();   // Active bonuses
const activeSkill = useActiveSkill();   // Currently training skill
const isHydrated = useIsHydrated();     // Store loaded from MMKV?
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

Handled by saving a single `SaveBlob` JSON to MMKV (key: `game-save`), using `@/game/save` for serialization + migrations.

### What Gets Persisted

| Persisted | Not Persisted |
|-----------|---------------|
| player | actions (tick, etc.) |
| skills | isHydrated |
| resources | |
| bag | |
| bagSettings | |
| quests | |
| achievements | |
| multipliers | |
| timestamps | |
| activeSkill | |
| rngSeed | |

## Offline Progress

- Cold start: store loads from `game-save` and applies `processOfflineProgress(...)`
- Resume: `TickManager` listens to `AppState` and calls `applyOfflineProgress(now)`

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
