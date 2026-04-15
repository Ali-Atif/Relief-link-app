import { Platform, type ViewStyle } from 'react-native';

/**
 * RN Web's StyleSheet validator rejects `direction` in registered styles, and warns on some
 * inline uses. Use `row` / `row-reverse` on web; keep `direction` on native for correct bidi.
 */
export function flexRowWithDirection(dir: 'ltr' | 'rtl'): ViewStyle {
  if (Platform.OS === 'web') {
    return { flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' };
  }
  return { flexDirection: 'row', direction: dir };
}

/** Block / column containers that only need `direction` on native. */
export function blockDirection(dir: 'ltr' | 'rtl'): ViewStyle {
  if (Platform.OS === 'web') {
    return {};
  }
  return { direction: dir };
}
