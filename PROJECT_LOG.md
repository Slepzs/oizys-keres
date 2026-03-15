# Project Log

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
