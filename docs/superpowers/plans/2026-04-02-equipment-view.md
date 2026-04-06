# Equipment View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Bag / Equipped" toggle to the Bag screen so players can view their equipped gear and swap items directly from the inventory.

**Architecture:** BagScreen gains a local view toggle that switches between the existing bag grid and a new EquipmentView. EquipmentView shows 6 equipment slots and a stat summary; tapping a slot opens a new SlotSwapSheet sticky panel (same pattern as BagItemDetailsSheet) listing eligible bag items with stat diffs.

**Tech Stack:** React Native, TypeScript, Zustand (useShallow + useMemo selectors pattern)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `store/selectors.ts` | Modify | Add `useBagEquipmentForSlot` selector |
| `store/index.ts` | Modify | Export `useBagEquipmentForSlot` |
| `ui/components/game/EquipmentSlot.tsx` | Modify | Accept optional `itemRarity` prop; render rarity border |
| `ui/components/game/SlotSwapSheet.tsx` | Create | Sticky swap panel: current item + eligible bag items with stat diffs |
| `ui/screens/bag/EquipmentView.tsx` | Create | 6-slot grid + total stat summary + selected slot state |
| `ui/screens/BagScreen.tsx` | Modify | Add "Bag / Equipped" toggle; render EquipmentView when active |

---

## Task 1: Add `useBagEquipmentForSlot` selector

**Files:**
- Modify: `store/selectors.ts`
- Modify: `store/index.ts`

- [ ] **Step 1: Add the selector to `store/selectors.ts`**

Add this function at the bottom of `store/selectors.ts`, after `useBagPotions`:

```typescript
export function useBagEquipmentForSlot(slot: EquipmentSlot) {
  const bagSlots = useGameStore(useShallow((state) => state.bag.slots));

  return useMemo(() => {
    const results: Array<{
      slotIndex: number;
      itemId: ItemId;
      quantity: number;
      name: string;
      icon: string;
      rarity: import('@/game/types').ItemRarity;
      stats: import('@/game/types').EquipmentStats;
      levelRequired: number | undefined;
    }> = [];

    bagSlots.forEach((bagSlot, index) => {
      if (!bagSlot) return;
      const def = ITEM_DEFINITIONS[bagSlot.itemId];
      if (!def || !isEquipment(def) || def.slot !== slot) return;
      results.push({
        slotIndex: index,
        itemId: bagSlot.itemId,
        quantity: bagSlot.quantity,
        name: def.name,
        icon: def.icon,
        rarity: def.rarity,
        stats: def.stats,
        levelRequired: def.levelRequired,
      });
    });

    return results;
  }, [bagSlots, slot]);
}
```

Also add these imports at the top of `store/selectors.ts` (they are already imported but verify `isEquipment` is present — it currently imports `isFood, isPotion` from `@/game/types/items`):

```typescript
import { isFood, isPotion, isEquipment } from '@/game/types/items';
import type { ItemId } from '@/game/types';
import type { EquipmentSlot } from '@/game/types';
```

- [ ] **Step 2: Export from `store/index.ts`**

Open `store/index.ts` and add `useBagEquipmentForSlot` to the existing selectors export block (alongside `useBagFood`, `useBagPotions`):

```typescript
  useBagEquipmentForSlot,
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `useBagEquipmentForSlot`.

- [ ] **Step 4: Commit**

```bash
git add store/selectors.ts store/index.ts
git commit -m "feat(inventory): add useBagEquipmentForSlot selector"
```

---

## Task 2: Enhance `EquipmentSlot` with rarity border

**Files:**
- Modify: `ui/components/game/EquipmentSlot.tsx`

- [ ] **Step 1: Update props and styles**

Replace the full contents of `ui/components/game/EquipmentSlot.tsx` with:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/constants/theme';
import type { EquipmentSlot as EquipmentSlotType, ItemRarity } from '@/game/types';
import type { ItemId } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';

const SLOT_ICONS: Record<EquipmentSlotType, string> = {
  weapon: '🗡️',
  helmet: '🪖',
  chest: '🦺',
  legs: '🩳',
  boots: '👢',
  accessory: '💍',
};

const SLOT_LABELS: Record<EquipmentSlotType, string> = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
  accessory: 'Accessory',
};

const RARITY_BORDER_COLORS: Record<ItemRarity, string> = {
  common: colors.rarityCommon,
  uncommon: colors.rarityUncommon,
  rare: colors.rarityRare,
  epic: colors.rarityEpic,
};

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  equippedItemId: string | null;
  itemRarity?: ItemRarity;
  onPress?: () => void;
}

export function EquipmentSlot({ slot, equippedItemId, itemRarity, onPress }: EquipmentSlotProps) {
  const item = equippedItemId ? ITEM_DEFINITIONS[equippedItemId as ItemId] : null;
  const borderColor = item && itemRarity ? RARITY_BORDER_COLORS[itemRarity] : 'transparent';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        item && styles.equipped,
        item && itemRarity && { borderColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{item?.icon ?? SLOT_ICONS[slot]}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {item?.name ?? SLOT_LABELS[slot]}
      </Text>
      {!item && <Text style={styles.emptyText}>Empty</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equipped: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add ui/components/game/EquipmentSlot.tsx
git commit -m "feat(inventory): add rarity border to EquipmentSlot"
```

---

## Task 3: Create `SlotSwapSheet` component

**Files:**
- Create: `ui/components/game/SlotSwapSheet.tsx`

This is the sticky bottom panel shown when a slot is selected in EquipmentView. It shows the currently equipped item (with unequip button) and lists eligible bag items with stat diffs.

- [ ] **Step 1: Create the file**

Create `ui/components/game/SlotSwapSheet.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { EquipmentSlot, ItemRarity, EquipmentStats } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { isEquipment } from '@/game/types/items';
import { useBagEquipmentForSlot, useCombatActions } from '@/store';
import { useGameActions } from '@/store/gameStore';

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
  accessory: 'Accessory',
};

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: colors.rarityCommon,
  uncommon: colors.rarityUncommon,
  rare: colors.rarityRare,
  epic: colors.rarityEpic,
};

interface SlotSwapSheetProps {
  slot: EquipmentSlot;
  equippedItemId: string | null;
  onClose: () => void;
}

function StatDiff({ label, current, next }: { label: string; current: number; next: number }) {
  const diff = next - current;
  if (diff === 0) {
    return (
      <Text style={styles.statNeutral}>
        {label}: {next} (=)
      </Text>
    );
  }
  return (
    <Text style={[styles.statDiff, diff > 0 ? styles.statPositive : styles.statNegative]}>
      {label}: {next} ({diff > 0 ? '+' : ''}{diff})
    </Text>
  );
}

export function SlotSwapSheet({ slot, equippedItemId, onClose }: SlotSwapSheetProps) {
  const { equipItem, addItem, removeItem } = useGameActions();
  const { unequipSlot } = useCombatActions();
  const bagItems = useBagEquipmentForSlot(slot);

  const equippedItem = equippedItemId
    ? ITEM_DEFINITIONS[equippedItemId as import('@/game/types').ItemId]
    : null;
  const equippedStats: EquipmentStats = equippedItem && isEquipment(equippedItem)
    ? equippedItem.stats
    : { attackBonus: 0, strengthBonus: 0, defenseBonus: 0 };

  const handleUnequip = () => {
    if (!equippedItemId) return;
    unequipSlot(slot);
    addItem(equippedItemId as import('@/game/types').ItemId, 1);
    onClose();
  };

  const handleEquip = (itemId: import('@/game/types').ItemId) => {
    const result = equipItem(itemId);
    if (!result.success) return;
    removeItem(itemId, 1);
    if (result.unequippedItemId) {
      addItem(result.unequippedItemId, 1);
    }
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.slotLabel}>{SLOT_LABELS[slot]}</Text>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          onPress={onClose}
          hitSlop={8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Currently equipped */}
      <View style={styles.equippedBlock}>
        <Text style={styles.sectionLabel}>Equipped</Text>
        {equippedItem && isEquipment(equippedItem) ? (
          <View style={styles.equippedRow}>
            <Text style={styles.itemIcon}>{equippedItem.icon}</Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: RARITY_COLORS[equippedItem.rarity] }]}>
                {equippedItem.name}
              </Text>
              <View style={styles.statsRow}>
                {equippedItem.stats.attackBonus > 0 && (
                  <Text style={styles.statChip}>Atk +{equippedItem.stats.attackBonus}</Text>
                )}
                {equippedItem.stats.strengthBonus > 0 && (
                  <Text style={styles.statChip}>Str +{equippedItem.stats.strengthBonus}</Text>
                )}
                {equippedItem.stats.defenseBonus > 0 && (
                  <Text style={styles.statChip}>Def +{equippedItem.stats.defenseBonus}</Text>
                )}
                {equippedItem.stats.attackSpeed && (
                  <Text style={styles.statChip}>{equippedItem.stats.attackSpeed}s</Text>
                )}
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.unequipButton, pressed && styles.unequipButtonPressed]}
              onPress={handleUnequip}
            >
              <Text style={styles.unequipButtonText}>Unequip</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nothing equipped</Text>
        )}
      </View>

      {/* Bag items for this slot */}
      <Text style={styles.sectionLabel}>In Bag</Text>
      {bagItems.length === 0 ? (
        <Text style={styles.emptyText}>No {SLOT_LABELS[slot]} items in your bag.</Text>
      ) : (
        <ScrollView
          style={styles.itemList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {bagItems.map((bagItem) => (
            <View key={bagItem.slotIndex} style={styles.bagItemRow}>
              <Text style={styles.itemIcon}>{bagItem.icon}</Text>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: RARITY_COLORS[bagItem.rarity] }]}>
                  {bagItem.name}
                </Text>
                <View style={styles.statDiffRow}>
                  {(bagItem.stats.attackBonus > 0 || equippedStats.attackBonus > 0) && (
                    <StatDiff
                      label="Atk"
                      current={equippedStats.attackBonus}
                      next={bagItem.stats.attackBonus}
                    />
                  )}
                  {(bagItem.stats.strengthBonus > 0 || equippedStats.strengthBonus > 0) && (
                    <StatDiff
                      label="Str"
                      current={equippedStats.strengthBonus}
                      next={bagItem.stats.strengthBonus}
                    />
                  )}
                  {(bagItem.stats.defenseBonus > 0 || equippedStats.defenseBonus > 0) && (
                    <StatDiff
                      label="Def"
                      current={equippedStats.defenseBonus}
                      next={bagItem.stats.defenseBonus}
                    />
                  )}
                  {bagItem.stats.attackSpeed && (
                    <Text style={styles.statNeutral}>{bagItem.stats.attackSpeed}s</Text>
                  )}
                </View>
                {bagItem.levelRequired && (
                  <Text style={styles.levelRequired}>
                    Requires Combat Lv. {bagItem.levelRequired}
                  </Text>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [styles.equipButton, pressed && styles.equipButtonPressed]}
                onPress={() => handleEquip(bagItem.itemId)}
              >
                <Text style={styles.equipButtonText}>Equip</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  equippedBlock: {
    gap: spacing.xs,
  },
  equippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  itemIcon: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statChip: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  unequipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  unequipButtonPressed: {
    opacity: 0.7,
  },
  unequipButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  itemList: {
    maxHeight: 200,
  },
  bagItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  statDiffRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statDiff: {
    fontSize: fontSize.xs,
  },
  statPositive: {
    color: colors.success,
  },
  statNegative: {
    color: colors.error,
  },
  statNeutral: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  levelRequired: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  equipButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  equipButtonPressed: {
    opacity: 0.8,
  },
  equipButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add ui/components/game/SlotSwapSheet.tsx
git commit -m "feat(inventory): add SlotSwapSheet component"
```

---

## Task 4: Create `EquipmentView` component

**Files:**
- Create: `ui/screens/bag/EquipmentView.tsx`

This renders inside BagScreen when the "Equipped" tab is active. Shows 6 slot tiles and the total stat summary. Tapping a slot sets it as selected, which drives the SlotSwapSheet.

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres/ui/screens/bag
```

Create `ui/screens/bag/EquipmentView.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { EquipmentSlot, EquipmentState, ItemRarity } from '@/game/types';
import { EQUIPMENT_SLOTS } from '@/game/types';
import { ITEM_DEFINITIONS } from '@/game/data';
import { isEquipment } from '@/game/types/items';
import { getTotalEquipmentStats } from '@/game/logic';
import { EquipmentSlot as EquipmentSlotTile } from '@/ui/components/game/EquipmentSlot';
import { SlotSwapSheet } from '@/ui/components/game/SlotSwapSheet';

interface EquipmentViewProps {
  equipment: EquipmentState;
  selectedSlot: EquipmentSlot | null;
  onSelectSlot: (slot: EquipmentSlot) => void;
  onCloseSlot: () => void;
  detailsHeight: number;
  onDetailsLayout: (height: number) => void;
}

function getItemRarity(itemId: string | null): ItemRarity | undefined {
  if (!itemId) return undefined;
  const def = ITEM_DEFINITIONS[itemId as import('@/game/types').ItemId];
  return def?.rarity;
}

export function EquipmentView({
  equipment,
  selectedSlot,
  onSelectSlot,
  onCloseSlot,
  detailsHeight,
  onDetailsLayout,
}: EquipmentViewProps) {
  const totalStats = getTotalEquipmentStats(equipment);

  return (
    <>
      {/* Slot grid */}
      <View style={styles.grid}>
        {EQUIPMENT_SLOTS.map((slot) => (
          <EquipmentSlotTile
            key={slot}
            slot={slot}
            equippedItemId={equipment[slot]}
            itemRarity={getItemRarity(equipment[slot])}
            onPress={() => onSelectSlot(slot)}
          />
        ))}
      </View>

      {/* Total stats summary */}
      <View style={styles.statsPanel}>
        <Text style={styles.statsPanelTitle}>Equipment Bonuses</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{totalStats.attackBonus}</Text>
            <Text style={styles.statLabel}>Attack</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{totalStats.strengthBonus}</Text>
            <Text style={styles.statLabel}>Strength</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{totalStats.defenseBonus}</Text>
            <Text style={styles.statLabel}>Defense</Text>
          </View>
        </View>
      </View>

      {/* Slot swap panel */}
      {selectedSlot !== null && (
        <View
          style={styles.stickyDetails}
          onLayout={(event) => {
            const h = event.nativeEvent.layout.height;
            if (h !== detailsHeight) onDetailsLayout(h);
          }}
        >
          <SlotSwapSheet
            slot={selectedSlot}
            equippedItemId={equipment[selectedSlot]}
            onClose={onCloseSlot}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  statsPanel: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  statsPanelTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surfaceLight,
  },
  stickyDetails: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add ui/screens/bag/EquipmentView.tsx
git commit -m "feat(inventory): add EquipmentView component"
```

---

## Task 5: Wire up BagScreen

**Files:**
- Modify: `ui/screens/BagScreen.tsx`

Add the "Bag / Equipped" toggle at the top of BagScreen and conditionally render `EquipmentView` when "Equipped" is selected.

- [ ] **Step 1: Apply changes to `ui/screens/BagScreen.tsx`**

**5a.** Add `EquipmentView` import and `useEquipment` import at the top of the file:

```typescript
import { EquipmentView } from './bag/EquipmentView';
import { useEquipment } from '@/store';
import type { EquipmentSlot } from '@/game/types';
```

**5b.** Add state variables inside the `BagScreen` component (after existing state declarations):

```typescript
const equipment = useEquipment();
const [activeView, setActiveView] = useState<'bag' | 'equipped'>('bag');
const [selectedEquipSlot, setSelectedEquipSlot] = useState<EquipmentSlot | null>(null);
const [equipDetailsHeight, setEquipDetailsHeight] = useState(0);
```

Note: the existing `BagScreen` already has a `selectedSlot` local variable derived from `selectedIndex` (the selected bag item). The new variable is named `selectedEquipSlot` to avoid the conflict.

**5c.** Replace the existing `<Text style={styles.title}>Bag</Text>` header block with a header + toggle:

Replace:
```typescript
<View style={styles.header}>
  <Text style={styles.title}>Bag</Text>
  <View style={styles.headerRight}>
    <Text style={styles.slotCount}>
      {usedSlots}/{bag.maxSlots} slots
    </Text>
    <Text style={styles.coins}>
      {'\u{1FA99}'} {formatNumber(coins)}
    </Text>
  </View>
</View>
```

With:
```typescript
<View style={styles.header}>
  <Text style={styles.title}>Inventory</Text>
  <View style={styles.headerRight}>
    <Text style={styles.slotCount}>
      {usedSlots}/{bag.maxSlots} slots
    </Text>
    <Text style={styles.coins}>
      {'\u{1FA99}'} {formatNumber(coins)}
    </Text>
  </View>
</View>

{/* View toggle */}
<View style={styles.viewToggle}>
  <Pressable
    style={({ pressed }) => [
      styles.viewToggleButton,
      activeView === 'bag' && styles.viewToggleButtonActive,
      pressed && styles.viewToggleButtonPressed,
    ]}
    onPress={() => { setActiveView('bag'); setSelectedEquipSlot(null); }}
  >
    <Text style={[styles.viewToggleText, activeView === 'bag' && styles.viewToggleTextActive]}>
      Bag
    </Text>
  </Pressable>
  <Pressable
    style={({ pressed }) => [
      styles.viewToggleButton,
      activeView === 'equipped' && styles.viewToggleButtonActive,
      pressed && styles.viewToggleButtonPressed,
    ]}
    onPress={() => { setActiveView('equipped'); setSelectedIndex(null); }}
  >
    <Text style={[styles.viewToggleText, activeView === 'equipped' && styles.viewToggleTextActive]}>
      Equipped
    </Text>
  </Pressable>
</View>
```

**5d.** Wrap the existing bag content (action bar, tabs, grid, empty state) in a conditional:

Wrap everything from `{/* Action Bar */}` down to the closing `</ScrollView>` bag content in:
```typescript
{activeView === 'bag' && (
  // ... existing action bar, tabs, grid, empty state JSX
)}
{activeView === 'equipped' && (
  <EquipmentView
    equipment={equipment}
    selectedSlot={selectedEquipSlot}
    onSelectSlot={setSelectedEquipSlot}
    onCloseSlot={() => setSelectedEquipSlot(null)}
    detailsHeight={equipDetailsHeight}
    onDetailsLayout={setEquipDetailsHeight}
  />
)}
```

**5e.** Update the `paddingBottom` in the `ScrollView` `contentContainerStyle` to account for both panels:

```typescript
contentContainerStyle={{
  paddingBottom: Math.max(
    activeView === 'bag' ? detailsHeight : equipDetailsHeight,
    insets.bottom + spacing.md
  ) + spacing.lg,
}}
```

**5f.** Keep the existing `{/* Sticky Item Details */}` block conditional on `activeView === 'bag'`. The existing condition `selectedSlot && selectedIndex !== null` already uses the bag-item-derived `selectedSlot`, which is fine — just wrap the outer block with `activeView === 'bag' &&`:

```typescript
{activeView === 'bag' && selectedSlot && selectedIndex !== null && (
  // ... existing BagItemDetailsSheet block unchanged
)}
```

**5g.** Add styles at the bottom of the `StyleSheet.create({...})` block:

```typescript
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: 2,
    marginBottom: spacing.md,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.surface,
  },
  viewToggleButtonPressed: {
    opacity: 0.7,
  },
  viewToggleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  viewToggleTextActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add ui/screens/BagScreen.tsx
git commit -m "feat(inventory): add Bag/Equipped toggle to BagScreen"
```

---

## Task 6: Smoke test end-to-end

- [ ] **Step 1: Start the dev server and open on simulator**

```bash
cd /Users/tobiasheidejensen/Projekter/Work/idle/oizys-keres && npx expo start
```

- [ ] **Step 2: Manual verification checklist**

Work through each scenario:

1. Open Bag screen — toggle "Bag / Equipped" visible at top
2. "Bag" view — existing grid and actions unchanged
3. Switch to "Equipped" — 6 slot tiles visible, stat summary shows total bonuses
4. All slots empty + no equipment items in bag — tap any slot → "No [Slot] items in your bag."
5. Add an equipment item via admin/debug → tap its bag slot → "Equip" button appears
6. Equip the item → slot shows the item icon with rarity-colored border, stat summary updates
7. Tap the now-equipped slot → swap sheet shows item with "Unequip" and any other bag options
8. Tap "Unequip" → item returns to bag, slot goes empty
9. With two same-slot items in bag → both listed with correct stat diffs (green/red)
10. Switch back to "Bag" tab → grid and item details work unchanged

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix(inventory): post-smoke-test corrections"
```
