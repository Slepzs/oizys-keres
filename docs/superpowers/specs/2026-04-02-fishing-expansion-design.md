# Fishing Expansion Design

Date: 2026-04-02
Status: Draft for review

## Summary

Expand fishing from a linear spot ladder into a route-identity system with:

- more progression content, especially after current mid/high levels
- richer catch tables per spot instead of one guaranteed fish output
- layered automation upgrades that deepen a chosen route
- ultra-rare milestone fish that grant permanent bonuses on first catch

The design stays aligned with the game’s core constraints:

- idle-first progression
- deterministic tick simulation
- data-driven balance
- minimal UI complexity
- pure game logic separated from UI

## Goals

- Make fishing choices matter beyond “pick highest unlocked spot.”
- Add meaningful midgame and high-level fishing progression.
- Keep fishing integrated with the existing economy, especially cooking.
- Add long-term chase content through ultra-rare permanent-bonus fish.
- Add automation depth without turning fishing into a separate sub-game.

## Non-Goals

- No timing-based mini-game or active reaction mechanic.
- No visual-heavy fishing scenes or animation system.
- No upkeep-heavy bait consumption, durability, or repair loops.
- No backend dependency or server-side fishing logic.
- No bespoke bonus engine if the existing multiplier system can express the reward.

## Player Experience

Fishing should offer three distinct decisions:

1. Which route to run right now
2. Which automation setup to apply to that route
3. Whether to optimize for XP, food supply, coin/value, or rare milestones

The result should be:

- early fishing feels simple and readable
- midgame fishing introduces route identity and automation tuning
- late fishing adds prestige waters and long-tail rare-fish hunts

## Core Design

### Spot Identity

Each fishing spot gets a role rather than acting as a strict replacement tier.

Supported roles:

- `xp`: faster actions and solid XP, but weaker economic output
- `supply`: reliable cooking fish production
- `value`: better uncommon/value catches
- `rare`: optimized for milestone-fish chasing

Each spot definition should include:

- unlock level
- required rod, if any
- role
- action cadence
- XP profile
- weighted common/uncommon/junk catch data
- rare-fish table, which may be empty for spots without a milestone catch

Lower and mid-level spots should remain relevant if they have a unique route identity.

### Recommended Spot Map

Keep existing spots, but rebalance their identities:

- `pond`: starter XP route
- `lake`: balanced food route
- `river`: faster XP route with some utility catches
- `bay`: salmon-focused supply route
- `deep_sea`: value-focused route
- `ocean`: balanced high-level route
- `abyss`: shark route plus prestige rare hunts

Add late-game waters so fishing does not flatten after the current top spots:

- `glacier_fjord`: high-level supply route
- `storm_shelf`: high-level value route
- `celestial_reef`: endgame rare-hunt route

These names can change during implementation, but the structure should remain: one late supply route, one late value route, and one late rare route.

### Rod Progression

Rods remain permanent unlock gates for harder waters. Add one more rod tier for new late-game routes.

Recommended rod progression:

- `river_rod`
- `deepwater_rod`
- `abyssal_rod`
- `mythic_rod` for the new late routes

Rod unlocks should stay shop-driven and permanent.

## Catch Model

### Common Catches

Common catches are the route’s main output and should mostly remain resource-based so they feed cooking and other existing systems cleanly.

Examples:

- pond: shrimp
- lake: sardine
- river: trout
- bay: salmon
- deep_sea: lobster
- ocean: swordfish
- abyss: shark
- glacier_fjord: new high-tier cooking fish
- storm_shelf: new value-oriented fish
- celestial_reef: elite fish with lower common throughput and better rare identity

### Uncommon Catches

Uncommon catches make spots distinct without replacing the core output.

They should be used for:

- extra value via sellable bag items
- utility items already supported by fishing drop flow
- selective future crafting or herblore hooks where cleanly supported

Implementation preference:

- if a catch is meant for cooking or dashboard resources, model it as a resource
- if a catch is meant to be sold or held in bag, model it as an item

### Junk Catches

Low-level and mid-level spots may include small junk tables so:

- early fishing is less efficient
- route-specialized automation upgrades matter
- cleaner high-level routes feel earned

Junk must stay lightweight and readable. Do not build a disposal subsystem.

If added, junk should simply be low-value bag items or low-value resources.

## Rare Fish Milestones

### Rule Set

Rare fish are unique milestone catches with extremely low rates.

Rules:

- each rare fish belongs to one spot
- each rare fish grants a permanent bonus on first catch only
- duplicate catches do not grant extra permanent power
- duplicates convert into trophy/value output only
- rare fish are long-term chases, not farmable power spikes

### Recommended Bonus Rules

Rare-fish bonuses should use the existing multiplier/stat systems where possible.

Preferred reward targets:

- `xp`
- `fishing`
- `drops`
- `all_skills`

Avoid building direct combat-stat bonuses in the first pass unless the current attribute system can consume them without extra infrastructure.

Recommended bonus sizing:

- early rare fish: roughly +1% to +2%
- mid rare fish: roughly +2% to +3%
- late rare fish: roughly +3% to +5%

Bonuses should stack slowly and remain meaningful but not mandatory.

### Recommended Rare Fish Examples

- `Golden Minnow` from pond: small global XP bonus
- `Moon Trout` from river: fishing XP bonus
- `Kingscale Salmon` from bay: drop-rate bonus
- `Void Lanternfish` from abyss: strong late-game fishing bonus
- `Starglass Ray` from celestial_reef: premium endgame progression bonus

Names are placeholders, but the structure matters:

- one early rare to teach the system
- two to three midgame milestone fish
- two or more late/endgame milestone fish

## Automation Layer

### Design Rule

Automation must deepen route choice, not create a separate management game.

### Upgrade Categories

Add permanent fishing automation upgrades that modify the selected route.

Recommended categories:

- `rig`: action speed modifier
- `bait`: catch-weight modifier
- `crew`: automation throughput modifier
- `utility`: junk reduction or uncommon-catch improvement

### Upgrade Behavior

Upgrades should be:

- permanently unlocked
- easy to read
- selectable or always-on depending on category
- balanced conservatively for rare-hunt bonuses

Recommended effects:

- `Float Rig`: faster actions on calm-water routes
- `Current Harness`: improved output on river/bay routes
- `Deepline Set`: improved uncommon/value catches on deep routes
- `Survey Crew`: better automation throughput for fishing only
- `Rare Lure Assembly`: very small rare-roll improvement, unlocked very late

Do not add consumable bait upkeep in the first implementation.

### Automation Decision Model

The player should be able to set up fishing like this:

- choose a spot
- choose a route upgrade profile when relevant

The system should support “this route is tuned for XP” versus “this route is tuned for rare hunts” without adding another full screen.

## Economy Integration

The user requested a mixed model:

- core fish outputs should integrate with the existing economy
- rare fish can remain mostly self-contained milestone content

Implementation guidance:

- common fish remain resource inputs for cooking
- uncommon catches can provide sellable value or selective utility
- rare milestone fish grant permanent bonuses and duplicate trophy/value payouts through sellable bag items

Do not require a large new economy loop to make fishing worthwhile.

## State and Save Design

### New Persistent State

Extend the existing fishing gear state instead of creating a parallel fishing-progression object.

Recommended shape:

```ts
type FishingUpgradeId =
  | 'float_rig'
  | 'current_harness'
  | 'deepline_set'
  | 'survey_crew'
  | 'rare_lure_assembly';

type RareFishId =
  | 'golden_minnow'
  | 'moon_trout'
  | 'kingscale_salmon'
  | 'void_lanternfish'
  | 'starglass_ray';

interface FishingGearState {
  ownedRodIds: FishingRodId[];
  ownedUpgradeIds: FishingUpgradeId[];
  discoveredRareFishIds: RareFishId[];
  activeUpgradePreset: 'xp' | 'supply' | 'value' | 'rare';
}
```

Defaults for new and migrated saves:

- `ownedRodIds: []`
- `ownedUpgradeIds: []`
- `discoveredRareFishIds: []`
- `activeUpgradePreset: 'supply'`

### Save Rules

- preserve backward compatibility with older saves
- add migration code, not manual transforms
- default old saves into an empty upgrade/discovery state
- repair invalid fishing selections on load the same way active spots are repaired today

## Logic Design

### Catch Resolution

Fishing should no longer rely on only `resourceProduced` for the actual route output.

Instead, per completed fishing action:

1. resolve the active spot
2. apply speed modifiers from fishing upgrades
3. roll on the spot’s weighted catch table
4. grant the resolved resource or item output
5. separately roll the rare-fish table if the spot has one
6. if a rare fish is first-time, store discovery and apply permanent bonus
7. if a rare fish is duplicate, grant its duplicate payout only

### Determinism

All rolls must continue to use the seeded RNG path already used by tick processing.

Requirements:

- no `Math.random()`
- no time-based nondeterminism
- same seed and elapsed time produce the same results

### Data Ownership

Keep fishing balance data in `game/data/`.

Likely data files to extend or add:

- `game/data/fishing-spots.data.ts`
- `game/data/fishing-rods.data.ts`
- `game/data/resources.data.ts`
- `game/data/items.data.ts`
- `game/data/cooking-recipes.data.ts`
- new fishing-upgrades data file
- new rare-fish data file

Keep reward resolution and state mutation in pure logic:

- `game/logic/fishing.ts`
- `game/logic/skills/tick.ts`

## UI Design

### Skill Detail

Keep fishing inside the current skill-detail flow.

Add to the fishing detail screen:

- improved spot cards with route role
- output preview for common/uncommon catches
- clear lock reasons
- compact automation upgrade summary
- rare-fish collection progress summary

Do not add a separate fishing management screen in this pass.

### Text-First Labels

If the game lacks icons for new catches or upgrades, use readable text labels.

This is an explicit user preference and should be followed over delaying the feature for art.

## Balancing Guidance

- XP route should not also be the best food and best rare route
- rare-hunt optimization should trade away some throughput
- junk reduction should feel strong early but less central late
- rare-fish bonus totals should stay modest even after collecting many milestones
- high-level spots should feel rewarding without invalidating all earlier route identities

## Testing Requirements

Use test-first coverage for the new behavior.

Minimum required tests:

- spot availability with new rod gates
- catch-table resolution remains deterministic
- automation upgrades alter route behavior as defined
- rare fish grant permanent bonuses only on first catch
- duplicate rare fish do not duplicate permanent power
- save migrations initialize the new fishing state correctly
- invalid saved fishing selections repair cleanly on load

## Recommended Implementation Sequence

1. Extend fishing types and save state
2. Add data definitions for spots, rods, upgrades, and rare fish
3. Implement catch-table resolution in pure fishing logic
4. Integrate rare-fish milestone rewards into multipliers/state
5. Update cooking/resources/items for new catch outputs
6. Expand fishing selectors and skill-detail UI
7. Add migration and regression tests

## Open Decisions Already Resolved With User

- fishing should include all three expansions: progression, catch variety, and automation depth
- fishing should follow spot identity, not a pure linear ladder
- economy integration should be mixed
- rare fish should grant permanent bonuses
- automation should follow the layered-upgrade recommendation

## Scope Check

This spec is intentionally limited to fishing progression and its direct hooks:

- fishing data
- fishing save state
- fishing logic
- fishing UI
- limited cooking/resource/item integration required to support new catches

It does not include a larger combat, economy, or crafting redesign.
