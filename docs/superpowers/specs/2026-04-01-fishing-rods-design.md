# Fishing Rods Design

Date: 2026-04-01
Status: Draft

## Goal

Add shop-bought fishing rods as permanent progression unlocks that gate higher-tier fishing spots and better fish.

This should make the shopkeeper part of the fishing progression loop without adding inventory clutter or equipment management.

## Non-Goals

- No rod items in the bag
- No fishing equipment slots
- No passive rod stat bonuses
- No per-frame or animation-heavy fishing changes

## Player Experience

Fishing progression should require two things:

1. the required fishing level
2. the required rod unlock

The player can still train fishing normally in lower-tier spots, but they must visit the shopkeeper to buy better rods before moving into stronger waters.

## Design

Use four permanent rod unlocks:

- `basic_rod` for `pond` and `lake`
- `river_rod` for `river` and `bay`
- `deepwater_rod` for `deep_sea` and `ocean`
- `abyssal_rod` for `abyss`

The player starts with no rod unlocks. The first shop purchase should be cheap enough that fishing remains available early, but later rods should become meaningful long-term gold sinks.

## State Design

Store rod ownership as part of the save blob, not as bag items.

Suggested shape:

```ts
type FishingRodId = 'basic_rod' | 'river_rod' | 'deepwater_rod' | 'abyssal_rod'

type FishingGearState = {
  ownedRodIds: FishingRodId[]
}
```

This keeps rod ownership deterministic, easy to migrate, and easy to query from pure fishing logic.

## Data Flow

- Shop offers grant permanent rod unlocks
- Fishing spots declare which rod is required
- Spot selection and active spot fallback both validate level and rod ownership
- Fishing selectors/UI expose locked reasons for missing rod vs missing level

## UI

### Shop

Add a `Fishing Gear` section above or near `Supplies` with rod offers, prices, and owned state.

Each card should clearly show:

- rod name
- short description
- coin price
- which waters it unlocks
- `Owned` state after purchase

### Fishing Spot Selector

Locked spots should show:

- level lock when fishing level is too low
- rod lock when level is met but the rod is missing

This keeps the progression legible instead of silently failing selection.

## Save / Migration

Add a new save version that initializes fishing gear for older saves.

Older saves should migrate to an empty `ownedRodIds` list so progression remains explicit and deterministic.

## Risks

- If rod checks only happen in the UI, saves could retain invalid active spots
- If rods are stored in multiple places, ownership could drift
- If pricing is too aggressive, fishing progression could feel blocked instead of paced

## Verification

Verify that:

- buying a rod marks it owned permanently
- owned rods survive save/load
- locked spots cannot be selected without the required rod
- default/active fishing spot falls back to the highest valid spot the player can actually use
- shop UI and fishing UI both explain rod ownership clearly
