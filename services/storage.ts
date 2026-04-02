import AsyncStorage from '@react-native-async-storage/async-storage';

/** Thin AsyncStorage wrapper — use for keys like user prefs or cached data later. */
export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
