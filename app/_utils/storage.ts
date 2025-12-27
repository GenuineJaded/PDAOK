import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../_constants/Types';

const STORAGE_KEY = '@pda_app_state';

/**
 * Save app state to AsyncStorage
 */
export async function saveAppState(state: AppState): Promise<void> {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving app state:', error);
  }
}

/**
 * Load app state from AsyncStorage
 */
export async function loadAppState(): Promise<AppState | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading app state:', error);
    return null;
  }
}

/**
 * Clear all app data (for reset)
 */
export async function clearAppState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing app state:', error);
  }
}

