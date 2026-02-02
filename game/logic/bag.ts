import type { BagState, BagSlot, ItemId, SortMode, ItemRarity, ItemCategory } from '../types/items';
import { ITEM_DEFINITIONS } from '../data/items.data';

const RARITY_ORDER: Record<ItemRarity, number> = {
  epic: 0,
  rare: 1,
  uncommon: 2,
  common: 3,
};

const CATEGORY_ORDER: Record<ItemCategory, number> = {
  equipment: 0,
  tool: 1,
  material: 2,
  misc: 3,
};

export interface AddItemResult {
  bag: BagState;
  added: number;
  overflow: number;
}

/**
 * Add items to the bag, stacking into existing slots first, then empty slots.
 * Returns the new bag state and how many items were added vs overflowed.
 */
export function addItemToBag(
  bag: BagState,
  itemId: ItemId,
  quantity: number
): AddItemResult {
  const definition = ITEM_DEFINITIONS[itemId];

  // Defensive: if item definition doesn't exist, return unchanged
  if (!definition) {
    console.warn(`Item ${itemId} not found in definitions`);
    return { bag, added: 0, overflow: quantity };
  }

  const maxStack = definition.maxStack;

  let remaining = quantity;
  const newSlots = [...bag.slots];

  // First, try to stack into existing slots with the same item
  for (let i = 0; i < newSlots.length && remaining > 0; i++) {
    const slot = newSlots[i];
    if (slot && slot.itemId === itemId && slot.quantity < maxStack) {
      const canAdd = Math.min(remaining, maxStack - slot.quantity);
      newSlots[i] = { itemId, quantity: slot.quantity + canAdd };
      remaining -= canAdd;
    }
  }

  // Then, fill empty slots
  for (let i = 0; i < newSlots.length && remaining > 0; i++) {
    if (newSlots[i] === null) {
      const toAdd = Math.min(remaining, maxStack);
      newSlots[i] = { itemId, quantity: toAdd };
      remaining -= toAdd;
    }
  }

  return {
    bag: { ...bag, slots: newSlots },
    added: quantity - remaining,
    overflow: remaining,
  };
}

export interface RemoveItemResult {
  bag: BagState;
  removed: number;
  remaining: number;
}

/**
 * Remove items from the bag.
 * Returns the new bag state and how many items were removed.
 */
export function removeItemFromBag(
  bag: BagState,
  itemId: ItemId,
  quantity: number
): RemoveItemResult {
  let remaining = quantity;
  const newSlots = [...bag.slots];

  // Remove from slots, starting from the end (preserves organization)
  for (let i = newSlots.length - 1; i >= 0 && remaining > 0; i--) {
    const slot = newSlots[i];
    if (slot && slot.itemId === itemId) {
      const toRemove = Math.min(remaining, slot.quantity);
      const newQuantity = slot.quantity - toRemove;

      if (newQuantity <= 0) {
        newSlots[i] = null;
      } else {
        newSlots[i] = { itemId, quantity: newQuantity };
      }

      remaining -= toRemove;
    }
  }

  return {
    bag: { ...bag, slots: newSlots },
    removed: quantity - remaining,
    remaining,
  };
}

/**
 * Count total quantity of an item across all slots.
 */
export function countItemInBag(bag: BagState, itemId: ItemId): number {
  return bag.slots.reduce((total, slot) => {
    if (slot && slot.itemId === itemId) {
      return total + slot.quantity;
    }
    return total;
  }, 0);
}

/**
 * Check if the bag has at least the specified quantity of an item.
 */
export function hasItemInBag(
  bag: BagState,
  itemId: ItemId,
  quantity: number = 1
): boolean {
  return countItemInBag(bag, itemId) >= quantity;
}

/**
 * Check if there's space for items (either in existing stacks or empty slots).
 */
export function hasSpaceForItem(
  bag: BagState,
  itemId: ItemId,
  quantity: number = 1
): boolean {
  const definition = ITEM_DEFINITIONS[itemId];

  // Defensive: if item definition doesn't exist, no space available
  if (!definition) {
    return false;
  }

  const maxStack = definition.maxStack;

  let availableSpace = 0;

  for (const slot of bag.slots) {
    if (slot === null) {
      // Empty slot can hold up to maxStack
      availableSpace += maxStack;
    } else if (slot.itemId === itemId) {
      // Existing stack can hold more
      availableSpace += maxStack - slot.quantity;
    }

    if (availableSpace >= quantity) {
      return true;
    }
  }

  return availableSpace >= quantity;
}

/**
 * Count empty slots in the bag.
 */
export function getEmptySlotCount(bag: BagState): number {
  return bag.slots.filter((slot) => slot === null).length;
}

/**
 * Get the count of used slots.
 */
export function getUsedSlotCount(bag: BagState): number {
  return bag.slots.filter((slot) => slot !== null).length;
}

/**
 * Check if the bag is full (no empty slots and all stacks are maxed).
 */
export function isBagFull(bag: BagState): boolean {
  return bag.slots.every((slot) => {
    if (slot === null) return false;
    const definition = ITEM_DEFINITIONS[slot.itemId];
    // Defensive: if definition doesn't exist, treat as full to prevent issues
    if (!definition) return true;
    return slot.quantity >= definition.maxStack;
  });
}

/**
 * Consolidate fragmented stacks of the same item.
 * Merges stacks together and moves all items to the front, nulls to the end.
 */
export function consolidateStacks(bag: BagState): BagState {
  // Group items by itemId
  const itemGroups = new Map<ItemId, number>();

  for (const slot of bag.slots) {
    if (slot) {
      const current = itemGroups.get(slot.itemId) ?? 0;
      itemGroups.set(slot.itemId, current + slot.quantity);
    }
  }

  // Rebuild slots with consolidated stacks
  const newSlots: (BagSlot | null)[] = [];

  for (const [itemId, totalQuantity] of itemGroups) {
    const definition = ITEM_DEFINITIONS[itemId];

    // Defensive: skip items without definitions
    if (!definition) {
      console.warn(`Item ${itemId} not found in definitions during consolidation`);
      continue;
    }

    let remaining = totalQuantity;

    while (remaining > 0) {
      const toAdd = Math.min(remaining, definition.maxStack);
      newSlots.push({ itemId, quantity: toAdd });
      remaining -= toAdd;
    }
  }

  // Fill remaining slots with null
  while (newSlots.length < bag.maxSlots) {
    newSlots.push(null);
  }

  return { ...bag, slots: newSlots };
}

/**
 * Sort bag contents by the specified mode.
 * Also consolidates stacks and moves items to front.
 */
export function sortBag(bag: BagState, mode: SortMode): BagState {
  // First consolidate to clean up fragmented stacks
  const consolidated = consolidateStacks(bag);

  // Get non-null slots
  const items = consolidated.slots.filter((slot): slot is BagSlot => slot !== null);

  // Sort based on mode
  items.sort((a, b) => {
    const defA = ITEM_DEFINITIONS[a.itemId];
    const defB = ITEM_DEFINITIONS[b.itemId];

    // Defensive: if definitions are missing, sort to end
    if (!defA) return 1;
    if (!defB) return -1;

    switch (mode) {
      case 'rarity':
        // Epic first, then rare, uncommon, common
        const rarityDiff = RARITY_ORDER[defA.rarity] - RARITY_ORDER[defB.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        // Secondary sort by name
        return defA.name.localeCompare(defB.name);

      case 'category':
        // Equipment first, then tool, material, misc
        const categoryDiff = CATEGORY_ORDER[defA.category] - CATEGORY_ORDER[defB.category];
        if (categoryDiff !== 0) return categoryDiff;
        // Secondary sort by rarity
        return RARITY_ORDER[defA.rarity] - RARITY_ORDER[defB.rarity];

      case 'quantity':
        // Highest quantity first
        const quantityDiff = b.quantity - a.quantity;
        if (quantityDiff !== 0) return quantityDiff;
        // Secondary sort by name
        return defA.name.localeCompare(defB.name);

      case 'name':
        return defA.name.localeCompare(defB.name);

      default:
        return 0;
    }
  });

  // Rebuild slots with sorted items and null padding
  const newSlots: (BagSlot | null)[] = [...items];
  while (newSlots.length < bag.maxSlots) {
    newSlots.push(null);
  }

  return { ...consolidated, slots: newSlots };
}

/**
 * Expand the bag by adding additional slots.
 */
export function expandBag(bag: BagState, additionalSlots: number): BagState {
  const newMaxSlots = bag.maxSlots + additionalSlots;
  const newSlots = [...bag.slots];

  // Add null slots for the expansion
  for (let i = 0; i < additionalSlots; i++) {
    newSlots.push(null);
  }

  return {
    ...bag,
    slots: newSlots,
    maxSlots: newMaxSlots,
  };
}

/**
 * Toggle the locked state of a slot at the given index.
 */
export function toggleSlotLock(bag: BagState, slotIndex: number): BagState {
  const slot = bag.slots[slotIndex];
  if (!slot) return bag;

  const newSlots = [...bag.slots];
  newSlots[slotIndex] = {
    ...slot,
    locked: !slot.locked,
  };

  return { ...bag, slots: newSlots };
}

/**
 * Remove items from a specific slot by index, respecting lock state.
 */
export function removeItemFromSlot(
  bag: BagState,
  slotIndex: number,
  quantity: number
): RemoveItemResult {
  const slot = bag.slots[slotIndex];

  if (!slot) {
    return { bag, removed: 0, remaining: quantity };
  }

  // Locked slots cannot be removed from
  if (slot.locked) {
    return { bag, removed: 0, remaining: quantity };
  }

  const toRemove = Math.min(quantity, slot.quantity);
  const newQuantity = slot.quantity - toRemove;

  const newSlots = [...bag.slots];
  if (newQuantity <= 0) {
    newSlots[slotIndex] = null;
  } else {
    newSlots[slotIndex] = { ...slot, quantity: newQuantity };
  }

  return {
    bag: { ...bag, slots: newSlots },
    removed: toRemove,
    remaining: quantity - toRemove,
  };
}

/**
 * Discard an entire slot (remove all items in that slot).
 */
export function discardSlot(bag: BagState, slotIndex: number): BagState {
  const slot = bag.slots[slotIndex];

  if (!slot || slot.locked) {
    return bag;
  }

  const newSlots = [...bag.slots];
  newSlots[slotIndex] = null;

  return { ...bag, slots: newSlots };
}
