# Combat Overlay Continuation Plan

Status: Stage 1 and Stage 2 are implemented on `feat/combat-overlay-stage-1`.

Implemented so far:

- Stage 1: side-view battle lane shell with placeholder actors
- Stage 2: real combat ability system for `Burst`, `Guard`, and `Recover`
- Store/UI wiring so the battle action bar reflects cooldowns and active effects
- Save migration for the new combat ability state

Current verified commands:

- `node -r tsconfig-paths/register -r sucrase/register --test game/logic/combat/abilities.test.js ui/screens/combat/battle-scene.model.test.ts ui/screens/combat-screen.sections.test.ts`
- `pnpm test:logic`
- touched-file ESLint pass on the Stage 2 files

Known repo-wide baseline issue:

- `tsc --noEmit` still fails outside this feature area in `game/logic/progress.ts`, `ui/components/game/CompletionSummaryCard.tsx`, `ui/components/game/QuestCard.tsx`, and `ui/screens/ProgressScreen.tsx`

## Next Stage

### Stage 3: Boss Prompt System

Goal:

- add one boss encounter with a real telegraph and decision strip
- keep the current deterministic combat loop
- make the prompt affect the outcome of a specific boss action

Recommended first boss loop:

- boss enters a `Void Slam` telegraph
- prompt strip offers `Interrupt`, `Brace`, `Burst`
- player choice is stored in combat state
- tick resolution applies the outcome at `resolvesAt`

Files likely involved:

- `game/types/combat.ts`
- `game/data/boss-encounters.data.ts`
- `game/logic/combat/commands.ts`
- `game/logic/combat/tick.ts`
- `game/systems/events.types.ts`
- `store/combatFeedback.ts`
- `ui/screens/combat/battle-scene.model.ts`
- `ui/screens/combat/CombatBattleScene.tsx`

Tests to add first:

- boss prompt generation
- prompt selection command
- prompt resolution in combat tick
- feedback/log text for telegraph and resolution

## Later Stage

### Stage 4: Content and Presentation Polish

- replace placeholders with real sprite assets
- add elite/boss presentation config
- add hit flashes, death timing polish, and telegraph visuals
- refine action labels and button affordances
- add additional boss patterns and progression hooks

## Restart Checklist

When resuming this branch later:

1. Open the worktree at `.worktrees/feat-combat-overlay-stage-1`
2. Re-run:
   - `node -r tsconfig-paths/register -r sucrase/register --test game/logic/combat/abilities.test.js ui/screens/combat/battle-scene.model.test.ts ui/screens/combat-screen.sections.test.ts`
   - `pnpm test:logic`
3. Ignore repo-wide `tsc --noEmit` failures unless they move into the combat files
4. Start Stage 3 with tests in `game/logic/combat`
