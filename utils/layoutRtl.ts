import { Platform, type ViewStyle } from 'react-native';

/**
 * Row that mirrors correctly in RTL on **all** platforms. Relying only on `direction` + `row`
 * is inconsistent on native; `row-reverse` matches web and mirrors icon/text reliably.
 */
export function flexRowWithDirection(dir: 'ltr' | 'rtl'): ViewStyle {
  return { flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' };
}

/** Block / column containers: set inline direction where the stylesheet engine allows it. */
export function blockDirection(dir: 'ltr' | 'rtl'): ViewStyle {
  if (Platform.OS === 'web') {
    return { direction: dir };
  }
  return { direction: dir };
}

/** Two-column grids: reverse row flow in RTL so tiles mirror like web. */
export function gridRowDirection(dir: 'ltr' | 'rtl'): ViewStyle {
  if (dir === 'rtl') {
    return { flexDirection: 'row-reverse', flexWrap: 'wrap' };
  }
  return { flexDirection: 'row', flexWrap: 'wrap' };
}
