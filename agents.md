Agent Guide – Incremental Automation RPG
Project Goal

Build a mobile-first incremental / idle RPG focused on:

progression systems

automation

data-driven mechanics

long-term play

Combat and visuals are secondary to systems, numbers, and player decision-making.

This is not a real-time action game.
This is not an art-heavy game.
This is a systems game.

Core Design Pillars

Data over visuals

Most gameplay is driven by numbers, timers, and state.

UI clarity > animation polish.

Idle first, active optional

The game should progress without constant interaction.

Active input should accelerate, not gate progress.

Automation is progression

Unlocking automation is a reward.

Manual actions should become obsolete over time.

Simple, readable systems

Prefer fewer mechanics with depth.

Avoid feature creep.

Tech Stack
Frontend

React Native

TypeScript

Functional components only

No heavy game engine abstractions

State Management

Local game state lives in memory

Persistent state is saved as a single blob

No relational game tables on the client

Backend (optional / later)

Used only for:

cloud saves

account sync

Backend does not run game logic

Save System
Philosophy

Save everything as one JSON blob

Do not normalize or split into tables

Version the save file

Example
type SaveBlob = {
  version: 1
  player: {
    level: number
    xp: number
  }
  skills: {
    woodcutting: {
      level: number
      xp: number
      automationUnlocked: boolean
    }
  }
  resources: {
    wood: number
  }
  timestamps: {
    lastActive: number
  }
}

Rules

Always be able to load older versions

Migrations are code, not DB scripts

Never trust the backend as source of truth

Game Loop Model

Game runs on ticks

Ticks are calculated from:

lastActive

now

Offline progress is simulated, not stored frame-by-frame

Tick Rules

Deterministic

No randomness without seeded RNG

Same input → same output

Progression Systems
Skills

Level-based

XP curves scale non-linearly

Each skill unlocks:

automation

efficiency

new interactions

Automation

Starts manual

Becomes semi-automatic

Eventually fully automatic

Automation should:

reduce clicks

introduce new optimization decisions

UI Principles

Mobile-first

Information density > visual flair

Avoid unnecessary animations

Numbers should be readable at a glance

Allowed Visuals

Icons

Simple sprites

Progress bars

Minimal combat scenes (optional)

Code Style Rules

No classes

No hidden side effects

Pure functions for game logic

UI and logic must be clearly separated

Folder Intent (example)
/game
  /logic      ← pure functions only
  /data       ← configs, curves, constants
  /systems    ← skills, automation, combat
/ui
  /screens
  /components

What NOT to Do

Don’t over-engineer persistence

Don’t build a combat engine first

Don’t chase visuals early

Don’t add multiplayer

Don’t simulate per-frame gameplay

Decision Bias

When in doubt:

choose simpler

choose data-driven

choose boring but reliable

choose something that ships

North Star Question

“Does this feature meaningfully increase long-term progression or player agency?”

If not, it probably doesn’t belong.


Explore other agents.md to gain context.

## React/Zustand Store Selectors (CRITICAL)

When creating Zustand selectors in this project, follow these patterns to avoid infinite loops:

### The Problem
Creating new objects inside selectors causes infinite re-renders because `useShallow` only does shallow comparison - nested new objects still trigger updates.

### Correct Pattern

```typescript
// ✅ CORRECT - Select primitives, use useMemo for derived state
export function usePlayerSummary() {
  const { level, xp } = useGameStore(
    useShallow((state) => ({ level: state.player.level, xp: state.player.xp }))
  );

  return useMemo(() => {
    const xpRequired = xpForPlayerLevel(level + 1);
    return { level, xp, xpRequired, progress: xpRequired > 0 ? xp / xpRequired : 1 };
  }, [level, xp]);
}
```

### Incorrect Pattern (causes infinite loops)

```typescript
// ❌ WRONG - Creates new objects every render
export function useBadSelector() {
  return useGameStore(
    useShallow((state) => {
      return {
        level: state.player.level,
        xpRequired: calculateXp(state.player.level), // Called in selector!
      };
    })
  );
}
```

### Key Rules

1. **Use `useShallow`** when selecting objects from the store
2. **Extract primitive values first**, then use `useMemo` for derived calculations
3. **Never transform data inside the selector** - do it in `useMemo`
4. **Always include dependencies** in the `useMemo` dependency array
