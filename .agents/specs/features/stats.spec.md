# Stats Tab – Specification & Implementation Notes

This document defines the **Stats tab** for the game. It is written as a working spec that can be expanded and refined over time, and is intended to be implementation‑ready.

---

## Goals

* Display **current player stats and skills** clearly.
* Be **data‑driven** (no hard‑coded UI logic per stat).
* Allow **easy expansion** (many more stats/skills later).
* Support future systems: buffs, gear, XP curves, unlocks, prestige.

---

## Initial Stats

### Attributes

* Health
* Attack
* Strength
* Defense
* Charisma
* Intelligence

### Skills

* Woodcutting
* Smithing
* Mining

These are the **base stats**. All stats must be defined via configuration, not embedded directly in UI components.

---

## Core Design Principle

> **Stats are defined once, stored as data, and rendered generically.**

Adding a new stat should not require modifying the Stats tab UI.

---

## Data Model

### 1. Stat Definitions (Static Registry)

Stat definitions live in code and describe *what a stat is*.

Each stat has a single definition entry.

**StatDefinition**

* `id` – string (stable key, e.g. `"health"`, `"woodcutting"`)
* `label` – display name
* `category` – `"attribute" | "skill"` (expandable later)
* `description` – short explanation
* `icon` – optional icon key
* `order` – number for sorting
* `format` – optional (`int`, `percent`, etc.)
* `visibility` – optional rules (locked / hidden until unlocked)

**Notes**

* IDs must never change (save‑file stability).
* UI ordering comes from `order`, not array position.
* New stats are added here first.

---

### 2. Player Stat State (Dynamic Save Data)

This is the data stored in the player save (MMKV / persisted blob).

#### Attributes

Attributes support modifiers and derived values.

Per attribute:

* `base` – permanent value (level ups, upgrades)
* `bonus` – flat additions (gear, buffs)
* `multiplier` – multiplicative effects (default `1.0`)
* `current` – only for resource‑type stats (e.g. Health)

Derived values (not necessarily stored):

* `effective` = `(base + bonus) * multiplier`
* `max` – for resource stats like Health

#### Skills

Skills track progression.

Per skill:

* `level`
* `xp`
* `xpToNext` – computed

Future‑safe optional fields:

* `tier` / `rank`
* `mastery`

---

### 3. Derived / Computed Stats

All formulas should live in **central selectors**, not in UI components.

Examples:

* `effectiveAttack = floor((base + bonus) * multiplier)`
* `healthMax = floor((base + bonus) * multiplier)`
* `healthPercent = current / max`

This allows rebalancing without touching UI code.

---

## UI Specification

### Layout

**Top summary (optional MVP)**

* Health bar (`current / max`)
* Optional derived value (e.g. Combat Power)

**Main content**

* Section: **Attributes**
* Section: **Skills**

Each section renders dynamically from the stat registry.

---

### Attribute Row

* Icon + label (left)
* Effective value (right, prominent)
* Optional subtext (small):

  * `Base + Bonus × Multiplier`

**Interaction**

* Tap / click opens a detail view:

  * Description
  * Breakdown of sources
  * Formula (optional dev toggle)

---

### Skill Row

* Icon + label
* Level (primary value)
* XP progress bar
* Text: `xp / xpToNext`

Future‑safe additions:

* Milestone unlocks
* Perks

---

## Rendering Rules

* UI loops over **stat definitions**, not player state keys.
* Stats can be filtered by:

  * category
  * visibility / unlock rules
* Sorting uses `order`.

---

## MVP Feature Set

* Show all base stats and skills
* Health with current/max
* Skill XP + level
* Generic stat detail view

---

## Planned Extensions (Already Supported by Model)

* Buffs & debuffs with timers
* Gear sources contributing to stats
* Skill perks and milestone rewards
* Multiple stat tabs (Combat, Gathering, Crafting, Social, Magic)
* Search / filter for large stat lists

---

## Suggested Formulas (Initial Defaults)

These are placeholders and can be rebalanced later.

* `HealthMax = 50 + (Strength × 10)`
* `AttackPower = Attack + floor(Strength × 0.5)`
* `DefenseRating = Defense`

### Skill XP Curve

XP required per level should be defined as a function.

Example:

```
xpToNext(level) = round(50 * level^1.6 + 100)
```

Keep this centralized for easy tuning.

---

## State & Persistence Notes

* Player stats are stored as **one blob**.
* Stat definitions live in code.
* On load:

  * Initialize missing stats using registry defaults
  * This enables adding new stats without breaking saves

---

## Non‑Goals (For Now)

* No prestige layers
* No respec system
* No PvP stat comparisons

---

## Key Rule

> **Adding a stat should never require editing the Stats tab UI.**

If that rule is violated, the model needs refactoring.
