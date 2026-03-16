# Project Log

## 2026-03-16 (automated) — session 3
- What was improved: Expanded the quest system with 22 new quests across four categories: (1) Mid/late combat quest chain — 12 quests from `crypt_clearer` (kill 10 skeletons) through `elder_nemesis` (kill 3 elder demons) covering every zone from the Ancient Crypt to the Abyssal Depths, each rewarding relevant resources or equipment items (mithril_sword, runic_helmet, rune_sword, arcane_warblade) at appropriate milestones. (2) Mining tier chain — 5 quests from `copper_vein` through `adamantite_lord` gating on each mining level threshold (10/25/40/55/70) and requiring collection of the matching tier ore, rewarding mining XP boosts. (3) Summoning progression chain — 3 quests (`awakened_bond`, `ascending_spirit`, `mythic_pact`) covering summoning levels 18/30/60 and spirit essence accumulation, extending the summoning narrative through all pet evolution stages. (4) Two new daily quests: `daily_goblin_hunt` (8 goblins, unlocks at player level 6) and `daily_undead_hunter` (6 skeletons, unlocks at player level 12) to give mid-game players a daily combat objective.
- Why it was improved: The quest system previously ended at `goblin_intel` (~level 15 equivalent) while combat extended to 73+ level enemies (elder demon), mining had 6 unlockable rock tiers, and summoning had 5 pets and 4 evolution stages — all with zero quest narrative. Players entering those systems had no milestone feedback, no directed rewards, and no progression anchors to motivate continued play in those zones.
- Strategic direction chosen: Saturate all major existing systems with quests before adding new mechanics — the architecture (quest handler, event bus, SKILL_ACTION/KILL events) was already in place. Data-only change; no runtime behavior altered.
- Next potential vector: Add a "Sell Ore" offer to ShopScreen for mithril_ore and adamantite_ore at premium rates, creating an economic pressure valve for players with surplus high-tier ores. Or add a prestige/mastery system for skills at max level.

## 2026-03-16 (automated) — session 2
- What was improved: Added an `ActiveSessionCard` component to the Dashboard that surfaces the player's live game state at a glance. The card shows three possible active rows — training skill (skill name, level, dual progress bars for current action cadence and XP-to-next-level), active combat (enemy name, icon, and dual HP bars for player and enemy), and auto-craft (recipe name and craft progress). Each row is tappable and navigates to its corresponding screen. When nothing is active a soft idle prompt is shown. The card is placed immediately below the player level card so it reads first on the main screen.
- Why it was improved: The Dashboard previously required navigating to three different screens (Skills, Combat, Crafting) to understand what was currently running. In an idle game the home screen must function as mission control — players need instant confirmation that their session is progressing without any taps.
- Strategic direction chosen: Improve observability of existing systems before adding new mechanics. The data was already present in the store via `useActiveSkill`, `useCombatTracker`, and crafting automation state — this change surfaces it where it matters most.
- Next potential vector: Add mid/late-game quest chains for rock-tier mining (copper, iron, mithril, adamantite progression quests), late combat zones (ruins, dragon_lair, abyssal_depths kill quests), and summoning pet evolution quests to extend the quest narrative into systems already built but under-quested.

## 2026-03-16 (automated)
- What was improved: Added a "Nearest Goals" panel to the CraftingScreen infrastructure summary card. The panel computes the 3 closest locked equipment/weapon/tool recipes — sorted by total remaining skill-level gap — and displays each with its primary blocking requirement (e.g. "Mining 30→55") and a per-recipe ore cost breakdown for key resources (copper_ore, iron_ore, coal, mithril_ore, adamantite_ore) showing current stock vs. required amount. Ore costs are color-coded green when met and grey when short. Infra-blocked recipes are sorted to the bottom so the most immediately actionable goals surface first.
- Why it was improved: Players had no way to scan which recipes were closest to being craftable or how much mining output they needed to accumulate before unlocking the next gear tier. Without this information, the gap between gathering and crafting progression was opaque — especially for mithril/adamantite which require dedicated mining levels and long accumulation times.
- Strategic direction chosen: Surface actionable, forward-looking information inside the existing crafting summary card rather than adding a new screen, keeping the change focused and consistent with the "make system state legible" pattern established in recent sessions.
- Next potential vector: Add a "Sell Ore" offer to the ShopScreen for mithril_ore and adamantite_ore at premium rates so players with surplus high-tier ores can convert them to coins, creating an economic pressure valve and a coin-sink alongside the existing crafting sink.


## 2026-03-15 20:30:00 +0100
- What was improved: Added active bonus visibility to CraftingScreen and StatsScreen. The CraftingScreen infrastructure summary card now shows an "Active Bonuses" panel listing every bonus granted by built infrastructure — value, target name, and source. StatsScreen gained a new "Bonuses" section at the bottom that surfaces all active multipliers from any source (infrastructure, achievements, upgrades), formatted with green value highlights.
- Why it was improved: Players could not see what bonuses their built infrastructure was providing without browsing each recipe individually. The Master Forge, which costs 600 mithril ore and 200 adamantite ore, granted +15% mining and +15% crafting XP with no visible confirmation in the UI, making the payoff of the endgame resource grind invisible and weakening motivation to complete it.
- Strategic direction chosen: Surface existing system state more legibly rather than adding new mechanics — make every built structure immediately justify its cost through clear, persistent feedback.
- Next potential vector: Add a "Top Ore Demand" hint to the Dashboard or CraftingScreen showing the highest-level recipes and how many mithril/adamantite ore each requires, so players can plan their gathering goals before reaching the unlock thresholds.

## 2026-03-15 20:01:00 +0100
- What was improved: Corrected the endgame recipe gates so every adamantite-consuming recipe, including the Master Forge, now requires mining level 70, and updated the crafting screen to derive the infrastructure total from the live definitions so the new forge tier is counted correctly.
- Why it was improved: The late-game ore loop had already been expanded, but several recipes were still visible before adamantite could actually be mined and the summary UI still reported the pre-forge infrastructure cap, which undermined progression clarity.
- Strategic direction chosen: Refine the newly added late-game economy for internal consistency before adding more content, with emphasis on matching resource unlock thresholds to recipe requirements.
- Next potential vector: Expose forge bonuses and top-tier ore demand more explicitly in the UI so players can immediately understand the payoff of unlocking mithril and adamantite.

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

## 2026-03-16 — Offline Progress Summary
- What was improved: Added full offline progress summary UX. Fixed `summarizeOfflineProgress` which was silently dropping all resource gains, item drops, and combat kills from the offline summary. Added `offlineSummary` as transient store state computed at boot, then built `OfflineProgressModal` that shows on Dashboard after being away 60+ seconds — displays skill XP gained, level-ups (highlighted), resources collected, items found, and enemies defeated.
- Why it was improved: The offline tick engine already processed progress correctly but showed players nothing — a core idle-game mechanic was completely invisible. Players returning after hours away had no feedback about what happened, which breaks the game feel of idle progression.
- Strategic direction chosen: Improve player feedback and session loop before expanding systems further. The modal gives clear value to each return visit and makes offline progress tangible.
- Next potential vector: Add an "offline efficiency" multiplier or cap visible in the modal to motivate players to upgrade infrastructure for better idle returns. Or expand mid/late quest chains (current last combat quest is goblin_intel at ~level 15 equivalent).
