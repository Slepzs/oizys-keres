# Tactical Combat Overlay Design

Date: 2026-04-06
Status: Draft approved in conversation, pending written spec review

## Goal

Add a more interactive combat presentation and decision layer to the existing combat system without violating the project's core constraints:

- idle first, active optional
- deterministic tick-based logic
- mobile-first information density
- no heavy engine abstractions
- no per-frame gameplay simulation

The target outcome is a 2D side-view battle scene where:

- the player avatar appears on the left
- enemies enter from the right and are visually defeated
- regular fights remain mostly automatic
- the player has a small set of active tactical buttons
- boss fights surface deeper decision windows with 2-3 meaningful responses

This feature is a tactical overlay on top of the current combat engine, not a new action combat system.

## Non-Goals

The design explicitly does not include:

- manual movement
- pathfinding
- collision physics
- jump/dodge platforming
- real-time positional combat authority in the UI
- a separate non-deterministic combat loop
- backend-managed combat logic

The side-scrolling lane is primarily presentation with tactical input, not a physics-driven game scene.

## Current State

The project already has a strong deterministic combat foundation:

- pure command/query/tick combat logic in [`game/logic/combat`](../../../game/logic/combat.ts)
- combat state owned in [`game/types/combat.ts`](../../../game/types/combat.ts)
- combat actions exposed through [`store/slices/combatSlice.ts`](../../../store/slices/combatSlice.ts)
- battle UI currently focused on telemetry in [`ui/screens/combat/CombatBattleView.tsx`](../../../ui/screens/combat/CombatBattleView.tsx)
- combat feedback/logging already available through the store feedback layer

The major gap is that there is no concept of:

- active abilities
- cooldowns
- boss prompts or telegraphs
- encounter phases
- scene presentation state for a battle lane

## Product Direction

The approved direction is:

- normal fights stay mostly automatic
- all combat continues to resolve through deterministic tick logic
- the battle scene is a visual representation of combat state and combat events
- regular encounters may include light tactical inputs
- boss encounters include deeper decision prompts
- the UI uses simple pixel-art style sprites when assets are available
- early iterations can use placeholder blocks instead of final art

The validated battle layout is:

- side-view lane
- player actor on the left
- enemy actor on the right
- optional next-enemy preview
- bottom action bar
- separate boss prompt strip when needed

## High-Level Architecture

The feature is split into four work areas.

### 1. Tactical Combat State

Extend `CombatState` with a compact overlay model. This state must be saveable and deterministic.

Recommended additions:

- `encounter`
  - `kind: 'normal' | 'elite' | 'boss'`
  - `encounterId: string | null`
  - `phase: number`
- `abilities`
  - `loadout: AbilityId[]`
  - `cooldowns: Record<AbilityId, number>`
  - optional `charges: Record<AbilityId, number>`
- `bossPrompt`
  - `promptId: string`
  - `resolvesAt: number`
  - `options: BossPromptOption[]`
  - `selectedOptionId: string | null`
- `scene`
  - lightweight presentation hints only if needed

Only durable tactical state belongs here. Animation frames do not.

### 2. Pure Tactical Rules

Add pure combat overlay logic under `game/logic/combat`:

- ability activation
- cooldown recovery
- timed effect durations
- boss telegraph spawning
- prompt response selection
- prompt resolution
- encounter phase transitions

All of these rules must remain deterministic and time-driven.

Player input affects future tick results by modifying combat values such as:

- bonus damage
- mitigation
- interrupt success
- temporary buffs
- phase-specific outcomes

### 3. Scene Presentation Layer

Add UI-only combat scene components under `ui/screens/combat` and reusable pieces under `ui/components` as needed.

Recommended components:

- `BattleLaneScene`
- `BattleActorSprite`
- `BattleActionBar`
- `BossPromptCard`
- `BattleEffectsLayer`

Responsibilities:

- render the side-view lane
- show player and enemy sprites
- play lightweight motion using `react-native-reanimated`
- show cooldown and prompt states
- remain a pure view of store state and feedback

### 4. Content Definitions

Add data-driven content files for:

- abilities
- boss encounters
- prompt options
- encounter presentation references
- sprite asset references

Avoid hardcoding boss logic into React components. Boss mechanics should be authored through data plus pure combat logic.

## Data Model

### Combat State Additions

Add new types in `game/types/combat.ts` for:

- `AbilityId`
- `BossPromptOption`
- `BossPromptState`
- `EncounterKind`
- `EncounterState`

Proposed shape:

```ts
type EncounterKind = 'normal' | 'elite' | 'boss'

type BossPromptOption = {
  id: string
  label: string
  effectId: string
}

type BossPromptState = {
  promptId: string
  resolvesAt: number
  options: BossPromptOption[]
  selectedOptionId: string | null
}

type TacticalCombatState = {
  encounter: {
    kind: EncounterKind
    encounterId: string | null
    phase: number
  }
  abilityLoadout: AbilityId[]
  abilityCooldowns: Record<AbilityId, number>
  bossPrompt: BossPromptState | null
}
```

These fields should merge into `CombatState`, not live in a separate store.

### Data Files

Recommended new files:

- `game/data/combat-abilities.data.ts`
- `game/data/boss-encounters.data.ts`
- `game/data/combat-scene.data.ts` if scene metadata starts growing

### Save Model

Persist:

- cooldown values
- current encounter metadata
- boss prompt state
- loadout

Do not persist:

- active animation frames
- transient UI-only playback state

This keeps save files migration-friendly and aligned with project rules.

## UI Design

### Battle Lane

The battle scene should visually communicate:

- who is active
- who is winning
- what attack or response is about to resolve
- what the player can press right now

Recommended structure:

1. top combat status strip
2. battle lane
3. optional cast/telegraph strip
4. optional boss prompt strip
5. bottom action bar

### Visual Style

The desired look is:

- 2D side-view
- simple pixel-art style
- enemies appear and get defeated visibly
- presentation supports regular combat clarity before visual polish

Early implementation can use:

- placeholder squares
- flat background layers
- simple hit flashes
- slide-in / recoil / fade-out animations

### Interaction Density

Regular encounters:

- 1-3 meaningful active buttons
- player does not need to press constantly

Boss encounters:

- same small action set
- additional prompt strip with 2-3 responses
- response timing matters

### Mobile Constraints

Keep:

- large tap targets
- no more than 3-4 bottom buttons visible at once
- health/telegraph clarity over decorative effects
- one clear decision surface at a time

## Mechanics Direction

### Regular Fights

Regular fights should remain mostly automatic. Tactical buttons accelerate or shape outcomes rather than gate progress.

Good first ability types:

- burst damage
- guard / mitigation
- heal or sustain action

These can initially operate as simple modifiers over existing combat numbers.

### Boss Fights

Boss fights should introduce:

- telegraphed attacks
- short decision windows
- 2-3 possible responses
- encounter phases later if needed

Example pattern:

- boss starts charging `Void Slam`
- `bossPrompt` becomes active for 2 seconds
- player chooses:
  - `Interrupt`
  - `Brace`
  - `Burst`
- when `resolvesAt` is reached, the chosen response modifies the outcome

This creates meaningful player agency without requiring manual movement.

## Tools and Runtime Requirements

The current repo already contains enough runtime tools for a first implementation:

- `react-native-reanimated`
- `expo-image`
- `react-native-gesture-handler`
- `expo-haptics`

Recommended use:

- React Native layout for the scene shell
- Reanimated for entrance, hit, telegraph, and death motion
- Expo Image for sprite and background assets
- standard buttons / pressables for abilities and prompt choices

No new rendering engine is required for v1.

### Art Pipeline

Recommended external tools for assets:

- Aseprite
- LibreSprite
- Piskel

Initial implementation can proceed with placeholder blocks until art is available.

## Rollout Plan

### Stage 1: Scene Shell

Replace the current battle panel with a side-view lane:

- player slot
- enemy slot
- optional next-enemy preview
- bottom action bar shell
- boss prompt strip shell
- lightweight placeholder motion

Buttons may initially be disabled or mocked if needed. The goal is validated structure.

### Stage 2: Ability System

Add 3 simple active abilities:

- burst / strike
- guard
- heal or sustain

Scope:

- ability data
- cooldown state
- `useAbility` command
- timed effects inside combat tick processing
- action bar wired to real combat state

### Stage 3: Boss Prompt System

Add one boss encounter with telegraphed decisions:

- boss prompt generation
- response selection
- timed resolution
- visible prompt strip in the battle scene

This is the first stage that delivers deeper tactical identity.

### Stage 4: Content and Polish

Add:

- more bosses
- better sprites
- hit effects
- elite variants
- loadout progression
- additional prompt patterns and phases

## Recommended First Deliverable

Ship Stage 1 and Stage 2 before expanding boss content.

This gives:

- immediate visual payoff
- early validation of the side-view scene
- proof that tactical input cadence works
- a lower-risk base for boss-specific systems

## Risks

### Risk: Turning the overlay into a second combat engine

Mitigation:

- all outcomes remain driven by pure tick logic
- UI never becomes combat authority

### Risk: Too many player actions in normal fights

Mitigation:

- keep normal encounters light
- limit visible actions to 3-4
- reserve deeper choices for boss prompts

### Risk: Presentation state bloating save data

Mitigation:

- persist tactical decision state only
- keep animation playback ephemeral in UI

### Risk: Boss logic becoming ad hoc

Mitigation:

- use data-driven boss definitions and prompt models from the start

## Testing Strategy

Add logic tests for:

- ability cooldown reduction
- timed effect expiration
- boss prompt generation and resolution
- deterministic outcomes from chosen prompt responses
- save/load stability for tactical state

Add UI tests only where structure is stable and useful. Prioritize pure logic coverage first.

## Open Follow-Up Topics

These are intentionally deferred until implementation planning:

- exact ability list
- first boss identity and prompt set
- sprite sheet format
- whether scene cues derive from feedback events or explicit scene state
- whether elite fights need prompts or only bosses do
