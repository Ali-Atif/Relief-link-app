import { getItem, setItem } from './storage';

/** AsyncStorage key prefix for offline-first emergency contacts (JSON array). */
const STORAGE_KEY_PREFIX = 'relieflink_emergency_contacts';
const LEGACY_STORAGE_KEY = 'relieflink_emergency_contacts';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

function getStorageKey(userId?: string): string {
  const scope = userId?.trim() || 'guest';
  return `${STORAGE_KEY_PREFIX}:${scope}`;
}

export async function getEmergencyContacts(userId?: string): Promise<EmergencyContact[]> {
  const scopedKey = getStorageKey(userId);
  const raw = await getItem(scopedKey);
  const parse = (value: string | null): EmergencyContact[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value) as EmergencyContact[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const scoped = parse(raw);
  if (scoped.length > 0 || userId == null) {
    return scoped;
  }
  // Migrate contacts from legacy global key to per-user key.
  const legacyRaw = await getItem(LEGACY_STORAGE_KEY);
  const legacy = parse(legacyRaw);
  if (legacy.length > 0) {
    await setItem(scopedKey, JSON.stringify(legacy));
  }
  return legacy;
}

export async function saveEmergencyContacts(contacts: EmergencyContact[], userId?: string): Promise<void> {
  await setItem(getStorageKey(userId), JSON.stringify(contacts));
}

export async function addEmergencyContact(
  input: { name: string; phone: string },
  userId?: string,
): Promise<void> {
  const list = await getEmergencyContacts(userId);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  list.push({
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
  });
  await saveEmergencyContacts(list, userId);
}

export async function removeEmergencyContact(id: string, userId?: string): Promise<void> {
  const list = await getEmergencyContacts(userId);
  await saveEmergencyContacts(
    list.filter((c) => c.id !== id),
    userId,
  );
}
