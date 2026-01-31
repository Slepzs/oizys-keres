import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = 'oizys_keres_save';

/**
 * Save data to persistent storage.
 */
export async function saveToStorage(data: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, data);
  } catch (error) {
    console.error('Failed to save to storage:', error);
    throw error;
  }
}

/**
 * Load data from persistent storage.
 */
export async function loadFromStorage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to load from storage:', error);
    throw error;
  }
}

/**
 * Clear saved data.
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
    throw error;
  }
}

/**
 * Check if a save exists.
 */
export async function hasSave(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(SAVE_KEY);
    return data !== null;
  } catch {
    return false;
  }
}
