import { getItem, setItem } from './storage';

/** AsyncStorage key for offline-first emergency contacts (JSON array). */
const STORAGE_KEY = 'relieflink_emergency_contacts';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const raw = await getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as EmergencyContact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export async function addEmergencyContact(input: { name: string; phone: string }): Promise<void> {
  const list = await getEmergencyContacts();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  list.push({
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
  });
  await saveEmergencyContacts(list);
}

export async function removeEmergencyContact(id: string): Promise<void> {
  const list = await getEmergencyContacts();
  await saveEmergencyContacts(list.filter((c) => c.id !== id));
}
