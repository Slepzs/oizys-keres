import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const STORAGE_ID = 'oizys-keres-game';

/**
 * MMKV instance for game persistence.
 * Synchronous and ~30x faster than AsyncStorage.
 */
export const storage: MMKV = createMMKV({
  id: STORAGE_ID,
});

/**
 * Zustand-compatible StateStorage adapter for MMKV.
 */
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

/**
 * Check if a save exists (sync).
 */
export function hasSaveSync(): boolean {
  return storage.contains('game-save') || storage.contains('game-storage');
}

/**
 * Clear all storage (sync).
 */
export function clearStorageSync(): void {
  storage.clearAll();
}
