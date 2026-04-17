import { Linking } from 'react-native';

/** Strip spaces/dashes for tel: — keeps + and digits */
function normalizeTel(phone: string): string {
  return phone.replace(/[\s\-()]/g, '').trim();
}

export async function openPhoneDialer(phone: string): Promise<boolean> {
  const cleaned = normalizeTel(phone);
  if (!cleaned) return false;
  try {
    await Linking.openURL(`tel:${cleaned}`);
    return true;
  } catch {
    return false;
  }
}

export async function openEmailComposer(email: string): Promise<boolean> {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes('@')) return false;
  try {
    await Linking.openURL(`mailto:${trimmed}`);
    return true;
  } catch {
    return false;
  }
}
