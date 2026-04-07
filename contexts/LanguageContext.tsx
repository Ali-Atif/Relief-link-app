import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { translate } from '../i18n/strings';
import type { AppLanguage } from '../i18n/types';
import { loadStoredLanguage, saveLanguagePreference } from '../services/languageStorage';

type LanguageContextValue = {
  language: AppLanguage;
  ready: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredLanguage();
      if (!cancelled && stored) {
        setLanguageState(stored);
      }
      if (!cancelled) {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang);
    await saveLanguagePreference(lang);
  }, []);

  const toggleLanguage = useCallback(async () => {
    const next: AppLanguage = language === 'en' ? 'ur' : 'en';
    await setLanguage(next);
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language],
  );

  const value = useMemo(
    () => ({ language, ready, setLanguage, toggleLanguage, t }),
    [language, ready, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx == null) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
