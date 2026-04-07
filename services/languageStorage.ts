import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLanguage } from '../i18n/types';

const STORAGE_KEY = 'relieflink_language';

export async function loadStoredLanguage(): Promise<AppLanguage | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === 'en' || raw === 'ur') {
    return raw;
  }
  return null;
}

export async function saveLanguagePreference(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}
