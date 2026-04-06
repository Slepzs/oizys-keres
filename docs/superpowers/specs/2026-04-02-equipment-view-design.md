# Equipment View & Bag Improvements — Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Context

The bag screen is the primary inventory management surface but currently has no way to view or manage equipped gear. Equipment is only accessible via a bottom sheet buried inside the Combat screen, and tapping a slot only unequips — there is no swap flow.

The goal is to make the Bag screen a complete inventory management hub: view your bag, view what's equipped, and swap gear directly from within the same screen.

---

## Design

### 1. View Toggle in BagScreen

Add a segmented toggle at the top of `BagScreen` with two options: **Bag** and **Equipped**. Style matches the existing `CombatScreenTabs` pattern.

- When "Bag" is active: existing bag grid + `BagItemDetailsSheet` (no changes)
- When "Equipped" is active: render `EquipmentView`

State: `useState<'bag' | 'equipped'>('bag')` local to `BagScreen`.

---

### 2. EquipmentView Component

New component at `ui/screens/bag/EquipmentView.tsx`.

**Slot grid:**
- Reuses `EquipmentSlot` (enhanced — see below)
- 6 slots: weapon, helmet, chest, legs, boots, accessory
- 3×2 grid layout, centered
- Tapping any slot (empty or occupied) selects it and opens `SlotSwapSheet`

**Stats summary panel below grid:**
- Shows total effective equipment bonuses: Attack Bonus, Strength Bonus, Defense Bonus
- Derived from `getTotalEquipmentStats(equipment, ITEM_DEFINITIONS)` (existing pure function in `game/logic/combat/queries.ts`)
- Three stat rows with labels and values

**Selected slot state:** `useState<EquipmentSlot | null>(null)` — controls which slot the swap sheet is showing.

---

### 3. EquipmentSlot Enhancement

`ui/components/game/EquipmentSlot.tsx` gains a rarity-colored border when an item is equipped, matching the rarity color system used in `BagSlot`. Empty slots retain the existing transparent border.

Pass `itemRarity` as an optional prop derived from the item definition in `EquipmentView`.

---

### 4. SlotSwapSheet Component

New component at `ui/components/game/SlotSwapSheet.tsx`. Sticky bottom panel, same position/style as `BagItemDetailsSheet`.

**Header section:**
- Slot name (e.g. "Weapon")
- If something is equipped: icon, name, rarity badge, full stats (attackBonus, strengthBonus, defenseBonus, attackSpeed)
- "Unequip" button — calls `unequipSlot(slot)` + `addItem(itemId, 1)`, clears selection
- If nothing equipped: "Empty slot" placeholder

**Item list section:**
- Sourced from `useBagEquipmentForSlot(slot)` selector (see below)
- Each row:
  - Item icon, name, rarity color
  - Stats: attack / strength / defense / speed
  - Stat diff vs currently equipped — `+4 Atk`, `−2 Def`, shown in `colors.success` / `colors.error`. Grey (`colors.textMuted`) if nothing currently equipped.
  - "Equip" button — calls `equipItem(itemId)` + `removeItem(itemId, 1)` + `addItem(unequippedId, 1)` if swap occurred
- If no eligible items: `"No [Slot] items in your bag."` empty state text

**Close:** tapping outside or an explicit close button clears selected slot.

---

### 5. New Selector: `useBagEquipmentForSlot`

Add to `store/selectors.ts`, following the `useBagFood` / `useBagPotions` pattern.

```typescript
export function useBagEquipmentForSlot(slot: EquipmentSlot) {
  const slots = useGameStore(useShallow((state) => state.bag.slots));
  return useMemo(() => {
    return slots
      .filter((s): s is BagSlot => s !== null)
      .flatMap((s) => {
        const def = ITEM_DEFINITIONS[s.itemId];
        if (!def || !isEquipment(def) || def.slot !== slot) return [];
        return [{ ...s, ...def }];
      });
  }, [slots, slot]);
}
```

---

## Files

| File | Change |
|---|---|
| `ui/screens/BagScreen.tsx` | Add view toggle ("Bag" / "Equipped"), render `EquipmentView` when active |
| `ui/screens/bag/EquipmentView.tsx` | **New** — slot grid + stat summary + selected slot state |
| `ui/components/game/SlotSwapSheet.tsx` | **New** — swap panel with current item, item list, stat diffs |
| `ui/components/game/EquipmentSlot.tsx` | Add optional `itemRarity` prop for rarity-colored border |
| `store/selectors.ts` | Add `useBagEquipmentForSlot(slot)` |

No changes to game logic, save schema, or CombatScreen.

---

## Verification

1. Open Bag screen — toggle appears at top, "Bag" view unchanged
2. Switch to "Equipped" — 6 slot grid visible, stat summary below
3. Tap an empty slot with a matching item in bag — swap sheet opens, item listed with grey diffs (nothing equipped)
4. Tap "Equip" — item moves to equipment, slot shows item with rarity border, stat summary updates
5. Tap an occupied slot — swap sheet shows equipped item with "Unequip" button, bag items listed with colored stat diffs
6. Tap "Unequip" — item returns to bag, slot shows empty
7. Tap an empty slot with no matching bag items — empty state message shown
8. Switch back to "Bag" tab — grid and details sheet work as before
