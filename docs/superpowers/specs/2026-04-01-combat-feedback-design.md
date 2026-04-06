# Combat Feedback Design

Date: 2026-04-01
Status: Draft

## Goal

Improve combat's moment-to-moment readability without changing combat mechanics.

The current combat loop is mechanically functional, but it feels delayed because the player cannot easily see:

- when the next attack will happen
- who is about to act
- what just happened across a combat run

This design adds two combat-specific feedback surfaces:

- a `Combat Rhythm` panel with attack timers
- a `Combat Log` panel with short rolling, high-signal entries

These changes should make combat feel active while staying aligned with the game's idle-first, data-driven design.

## Non-Goals

- No combat formula changes
- No new combat abilities or manual inputs
- No persistence changes to the save blob
- No reuse of toast notifications for combat transcript UI
- No offline backfill into the combat log

## Player Experience

When combat is active, the combat screen should show:

1. A timer-based rhythm panel directly under the active enemy display.
2. A readable in-screen combat log that behaves like a battle transcript, not a toast queue.

The player should be able to glance at the combat screen and answer:

- Who attacks next?
- How soon is the next hit?
- What just happened over the last few actions?
- How many enemies have I killed in this current run?

## UI Design

### Combat Rhythm

Location:
- Directly below the active combat display in the combat screen

Content:
- `You` timer bar
- `Enemy` timer bar
- `Pet` timer bar when a pet is active in combat

Behavior:
- Each row shows label, progress bar, and short time text such as `0.8s`
- The bar fills toward the next scheduled action
- When an action triggers, the bar resets and starts filling again
- The component updates smoothly while combat is active using a local `now` interval

Data source:
- `activeCombat.playerNextAttackAt`
- `activeCombat.enemyNextAttackAt`
- `activeCombat.petNextAttackAt`
- player attack speed
- enemy attack speed
- pet attack interval

### Combat Log

Location:
- Directly below the rhythm panel in the combat screen

Content:
- Title: `Combat Log`
- Small session summary line such as `12 kills this session`
- Fixed-height scroll area
- Newest entries first
- Keep only the latest `10-12` entries

Behavior:
- One-line entries only
- High-signal events only
- Does not float above the UI
- Does not share styling or behavior with toast notifications
- Clears when a new app session begins or when combat feedback state is reset

Example entries:
- `You hit Giant Rat for 6`
- `Crit! You hit Giant Rat for 12`
- `Giant Rat hits you for 2`
- `Regen +1 HP`
- `Killed Giant Rat`
- `Loot: Rat Fang x1`

## Event Selection Rules

Include only high-signal combat events:

- `COMBAT_PLAYER_ATTACK`
- `COMBAT_ENEMY_ATTACK`
- `COMBAT_PLAYER_REGEN`
- `COMBAT_PET_ATTACK`
- `COMBAT_ENEMY_KILLED`
- `COMBAT_ITEM_DROPPED`

Do not include:

- `COMBAT_STARTED`
- coin gain events
- combat skill level-up events
- generic bag full events
- offline progress summaries

Critical hits should be rendered distinctly in text, for example by prefixing the line with `Crit!`.

## State Design

Add a transient combat feedback slice in the Zustand store.

Suggested shape:

```ts
type CombatLogEntry = {
  id: string
  at: number
  text: string
}

type CombatFeedbackState = {
  entries: CombatLogEntry[]
  killsThisSession: number
  sessionStartedAt: number | null
}
```

Rules:

- This state is UI-only and must not be persisted in the save blob
- This state should not live inside `game/` save structures
- This state should be updated from tick-emitted combat events in the store layer
- This state should be easy to reset explicitly

## Data Flow

### Timers

The timer UI should derive progress from existing combat timestamps rather than storing duplicate progress state.

Recommended approach:

- Select primitive timing values from the store
- Use a small component-local interval while combat is active
- Compute remaining time and progress in `useMemo`

This matches the project rule for Zustand selectors:

- selectors return primitives
- derived objects and progress values are computed outside the selector

### Combat Log

The combat log should be updated inside the store tick pipeline after `processTick` returns events and before final store state is committed.

Recommended flow:

1. `processTick` returns `events`
2. Store maps relevant combat events into log lines
3. Store prepends those lines into transient combat feedback state
4. Store caps entry count to the configured limit
5. Store increments `killsThisSession` when a kill event is present

The existing notification system remains unchanged and should not be reused for this transcript.

## Reset Rules

Reset combat feedback when:

- the app boots into a new session
- the store is reset

Do not reset simply because one enemy dies. The goal is a rolling session transcript, not a per-fight transcript.

## Files Likely Affected

- `store/gameStore.ts`
- `store/index.ts`
- `store/selectors.ts`
- `store/slices/tickSlice.ts`
- `ui/screens/CombatScreen.tsx`
- new combat rhythm component in `ui/components/game/`
- new combat log component in `ui/components/game/`

## Risks

- If the log is built from notifications instead of raw combat events, it will inherit toast behavior and become noisy
- If progress math is done inside Zustand selectors, the combat screen may rerender excessively
- If offline events populate the log, returning to the app may create a large unreadable burst

## Verification

Verify manually that:

- timer bars move continuously during active combat
- player, enemy, and pet timers reset on their respective turns
- log entries appear in correct order
- only high-signal events are shown
- kills this session increments correctly
- no combat log entries survive a full app restart
- existing toast notifications still work independently
