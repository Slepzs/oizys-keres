# Project Log

## 2026-03-15 19:30:00 +0100
- What was improved: Wired mithril_ore and adamantite_ore into the full crafting progression. All mithril-tier armor and weapons now consume mithril_ore instead of iron_ore (mining req bumped to 55). Runic-tier gear now requires mithril_ore as primary metal (mining req 60–62). Arcane-tier gear and late accessories now require mithril_ore + adamantite_ore alongside coal (mining req 65–67). Added the Master Forge infrastructure (build_forge recipe), a permanent +15% mining XP / +15% crafting XP structure requiring mithril_ore 600 + adamantite_ore 200 to construct — the first concrete endgame sink for both high-tier ores.
- Why it was improved: The previous state had a naming/value mismatch: "mithril" gear used generic iron ore, and mithril_ore/adamantite_ore accumulated without any meaningful downstream demand. The Master Forge creates a concrete production goal that motivates players to grind the mithril and adamantite tiers instead of idling on iron/coal.
- Strategic direction chosen: Close the ore economy loop before adding new systems — make every mining tier yield resources that matter to a specific crafting band.
- Next potential vector: Add shop sell offers for mithril_ore and adamantite_ore so players can convert surplus ores to coins, or expand crafting into consumable/buff items that use high-tier ores as fuel.

## 2026-03-15 18:45:27 +0100
- What was improved: Routed mid- and late-game crafting recipes to copper ore, iron ore, and coal instead of a single generic ore pool, added ore stockpile achievements for coal/mithril/adamantite progression, and expanded the dashboard resource summary to surface newly gathered resource tiers.
- Why it was improved: Mining tier unlocks existed, but downstream progression still flattened most crafting demand into generic ore and hid advanced resource stocks from the main UI, which weakened the economy and made high-tier gathering feel disconnected.
- Strategic direction chosen: Deepen the existing gathering-to-crafting loop before adding more systems, with emphasis on making specialized resource tiers visible and economically meaningful.
- Next potential vector: Introduce late-game crafting or shop sinks for mithril and adamantite so the highest mining tiers feed concrete production goals instead of only achievement progression.

## 2026-03-15 16:20:35 +0100
- What was improved: Hardened gathering specialization state by introducing typed tree/rock tier IDs, normalizing invalid selections on load and admin level changes, and exposing mining target selectors alongside woodcutting in the store/UI.
- Why it was improved: The mining rock tier system was already shipped, but persisted or down-leveled selections could drift out of sync with the player’s actual level and the UI was still doing raw lookups instead of using normalized selectors.
- Strategic direction chosen: Stabilize progression systems before expanding them further, with emphasis on type-safe data-driven state and deterministic save repair.
- Next potential vector: Connect the new tier-specific ores into crafting recipes, shop valuation, and progression unlocks so mining tiers affect the broader economy.

## 2026-03-15 16:14:49 +0100
- What was improved: Added mining rock tiers, tier-specific ore resources, save migration for `activeRockId`, and the mining rock selector UI.
- Why it was improved: Mining needed progression parity with woodcutting so players could make longer-term gathering decisions instead of training against a single static resource profile.
- Strategic direction chosen: Expand core gathering progression with data-driven specialization rather than adding new surface-level systems.
- Next potential vector: Normalize selected gathering targets and integrate the new ore outputs into downstream crafting/economy systems.
- Source: commit `ec48450a3d47f03ca9657be9bf3c7f1afc04961c`
