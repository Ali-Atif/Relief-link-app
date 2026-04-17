import { Linking } from 'react-native';

/**
 * Opens a maps / HTTPS URL from an SOS alert. Adds https:// if the string has no scheme.
 * @returns true if `openURL` was invoked without throwing
 */
export async function openMapsLink(url: string): Promise<boolean> {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return false;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    await Linking.openURL(withScheme);
    return true;
  } catch {
    return false;
  }
}
