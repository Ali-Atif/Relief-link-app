import { useLayoutEffect } from 'react';

import { useLanguage } from '../contexts/LanguageContext';

/** Sets the stack header title when the screen mounts or language changes. */
export function useTranslatedHeader(
  navigation: { setOptions: (o: { title: string }) => void },
  titleKey: string,
) {
  const { t } = useLanguage();
  useLayoutEffect(() => {
    navigation.setOptions({ title: t(titleKey) });
  }, [navigation, t, titleKey]);
}
