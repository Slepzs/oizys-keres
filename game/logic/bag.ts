import type { BagState, BagSlot, ItemId } from '../types/items';
import { ITEM_DEFINITIONS } from '../data/items.data';

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
    return slot.quantity >= definition.maxStack;
  });
}
