# Bag System Improvements Specification

## Overview

This document outlines all planned bag management features and quality-of-life improvements, organized by implementation priority.

---

## Tier 1 - Essentials

Core features needed for basic functionality.

### 1.1 Delete/Discard Items

**Status:** Implementing

**Description:** Allow players to permanently remove items from their bag.

**Implementation:**
- Add "Discard" button in item details panel (BagGrid.tsx)
- Show confirmation before discarding
- Reuse existing `removeItem(itemId, quantity)` action
- Clear selection after discard

**Files:**
- `ui/components/game/BagGrid.tsx` - Add discard button

---

### 1.2 Sort Bag

**Status:** Implementing

**Description:** Allow players to sort their bag contents by various criteria.

**Sort Modes:**
- `rarity` - Epic > Rare > Uncommon > Common
- `category` - Equipment > Tool > Material > Misc
- `quantity` - Highest first
- `name` - Alphabetical

**Implementation:**
- Add `SortMode` type to `game/types/items.ts`
- Create `sortBag(bag, mode)` function in `game/logic/bag.ts`
- Consolidate stacks during sort (items to front, nulls to end)
- Add sort button/dropdown in BagScreen header

**Files:**
- `game/types/items.ts` - Add SortMode type
- `game/logic/bag.ts` - Add sortBag function
- `store/gameStore.ts` - Add sortBag action
- `ui/screens/BagScreen.tsx` - Add sort UI

---

### 1.3 Pause Actions When Bag Full

**Status:** Implementing

**Description:** Prevent item loss by pausing skill actions when the bag is full.

**Implementation:**
- Add `ACTIONS_PAUSED_BAG_FULL` event type
- Check `isBagFull(state.bag)` before processing skill drops
- Skip tick processing when bag is full
- Actions resume automatically when space is freed
- UI can listen for event to show notification

**Files:**
- `game/logic/tick.ts` - Add bag full check
- `game/types/index.ts` - Add event type (already exists as BAG_FULL)

---

## Tier 2 - Quality of Life

Features that enhance the gameplay experience.

### 2.1 Auto-Sort Toggle

**Status:** Implementing

**Description:** Automatically sort bag after each item is added.

**Implementation:**
- Add `bagSettings` to GameState: `{ autoSort: boolean, sortMode: SortMode }`
- When enabled, call `sortBag()` after each `addItemToBag()`
- Add toggle switch in BagScreen UI
- Requires save migration

**Files:**
- `game/types/state.ts` - Add bagSettings
- `game/save/schema.ts` - Bump version
- `game/save/migrations.ts` - Add migration
- `game/save/initial-state.ts` - Add default settings
- `game/logic/bag.ts` - Auto-sort after add
- `store/gameStore.ts` - Add toggleAutoSort action
- `ui/screens/BagScreen.tsx` - Add toggle UI

---

### 2.2 Quick-Stack (Consolidate)

**Status:** Implementing

**Description:** Merge fragmented stacks of the same item type.

**Implementation:**
- Create `consolidateStacks(bag)` function
- Merge same-item stacks together
- Move all items to front, nulls to end
- Add "Consolidate" button in BagScreen header

**Files:**
- `game/logic/bag.ts` - Add consolidateStacks function
- `store/gameStore.ts` - Add consolidateBag action
- `ui/screens/BagScreen.tsx` - Add button

---

### 2.3 Lock Slots

**Status:** Implementing

**Description:** Prevent specific slots from being discarded or sold.

**Implementation:**
- Add `locked?: boolean` to BagSlot type
- Locked items cannot be discarded
- Show lock icon overlay on slot
- Toggle via long-press or button in details panel

**Files:**
- `game/types/items.ts` - Add locked to BagSlot
- `game/save/migrations.ts` - Migration for locked field
- `game/logic/bag.ts` - Respect locks in remove operations
- `ui/components/game/BagSlot.tsx` - Show lock icon
- `ui/components/game/BagGrid.tsx` - Add lock toggle
- `store/gameStore.ts` - Add toggleSlotLock action

---

### 2.4 Bag Expansion

**Status:** Implementing

**Description:** Allow players to increase their bag capacity.

**Implementation:**
- Create `expandBag(bag, additionalSlots)` function
- Increases `maxSlots` and adds null slots
- Logic only for now (no UI trigger)
- Can be called from quest rewards later

**Files:**
- `game/logic/bag.ts` - Add expandBag function
- `store/gameStore.ts` - Add expandBag action

---

## Tier 3 - Monetization/Progression

Features for future monetization or progression systems.

### 3.1 Overflow Storage

**Status:** Planning

**Description:** Temporary storage for items that don't fit in the main bag.

**Implementation Ideas:**
- Separate overflow queue with time limit
- Must be collected before expiring
- Could be expanded with premium currency

---

### 3.2 Premium Bag Tabs

**Status:** Planning

**Description:** Additional bag tabs purchasable with premium currency.

**Implementation Ideas:**
- Separate tabs for different item categories
- Quick switching between tabs
- Each tab has its own slot limit

---

### 3.3 Auto-Sell Threshold

**Status:** Planning

**Description:** Automatically sell items below a certain rarity.

**Implementation Ideas:**
- Configurable rarity threshold
- Toggle for each item category
- Immediate gold conversion

---

## Tier 4 - Gameplay Depth

Features that add strategic depth.

### 4.1 Item Favorites/Pins

**Status:** Planning

**Description:** Mark favorite items for quick access.

**Implementation Ideas:**
- Favorite badge on slots
- Favorites sorted to top
- Quick-access panel

---

### 4.2 Filter View

**Status:** Planning

**Description:** Filter bag display by category or rarity.

**Implementation Ideas:**
- Filter dropdown/tabs
- Show/hide based on criteria
- Combine with search

---

### 4.3 Bag Weight/Encumbrance

**Status:** Planning

**Description:** Weight system affecting movement or actions.

**Implementation Ideas:**
- Weight per item type
- Encumbrance penalties
- Weight-reducing items

---

### 4.4 Item Details Modal

**Status:** Planning

**Description:** Full-screen modal with detailed item information.

**Implementation Ideas:**
- Detailed stats and lore
- Item history/source
- Use/equip options

---

### 4.5 Trash Bin with Undo

**Status:** Planning

**Description:** Recoverable deletion for recently discarded items.

**Implementation Ideas:**
- Trash holds last N items
- Time-limited recovery
- Permanent delete option

---

## Tier 5 - Advanced Features

Complex features for later development.

### 5.1 Crafting Integration

**Status:** Planning

**Description:** Use bag items directly in crafting UI.

**Implementation Ideas:**
- Recipe auto-detection
- Material highlighting
- One-click craft from bag

---

### 5.2 Sell to Vendor

**Status:** Planning

**Description:** Sell items for currency through vendor NPCs.

**Implementation Ideas:**
- Vendor UI with prices
- Bulk sell options
- Price negotiation

---

### 5.3 Item Decomposition

**Status:** Planning

**Description:** Break down items into base materials.

**Implementation Ideas:**
- Decompose recipes
- Partial material return
- Skill-based efficiency

---

### 5.4 Collection Log

**Status:** Planning

**Description:** Track all items ever obtained.

**Implementation Ideas:**
- Completion percentage
- First-obtained timestamps
- Achievement rewards

---

### 5.5 Storage Chest

**Status:** Planning

**Description:** Long-term storage separate from active bag.

**Implementation Ideas:**
- Home base storage
- Transfer UI
- Organization tabs

---

## Implementation Status Summary

| Feature | Tier | Status |
|---------|------|--------|
| Delete/Discard Items | 1 | Implementing |
| Sort Bag | 1 | Implementing |
| Pause When Full | 1 | Implementing |
| Auto-Sort Toggle | 2 | Implementing |
| Quick-Stack | 2 | Implementing |
| Lock Slots | 2 | Implementing |
| Bag Expansion | 2 | Implementing |
| Overflow Storage | 3 | Planning |
| Premium Bag Tabs | 3 | Planning |
| Auto-Sell Threshold | 3 | Planning |
| Item Favorites | 4 | Planning |
| Filter View | 4 | Planning |
| Bag Weight | 4 | Planning |
| Item Details Modal | 4 | Planning |
| Trash Bin | 4 | Planning |
| Crafting Integration | 5 | Planning |
| Sell to Vendor | 5 | Planning |
| Item Decomposition | 5 | Planning |
| Collection Log | 5 | Planning |
| Storage Chest | 5 | Planning |
