/**
 * SOS flow: GPS → create NGO alert (when signed in) → SMS to emergency contacts (or save pending SMS).
 * Used by `useSosEmergency` / `SosButton` on the home screen.
 */

import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

import { auth } from './firebase';
import { getEmergencyContacts } from './emergencyContactsStorage';
import { createSosAlert } from './sosAlertsService';
import { getUserProfile } from './userProfiles';
import { getItem, removeItem, setItem } from './storage';

export type SosFailureReason =
  | 'no_contacts'
  | 'permission_denied'
  | 'location_unavailable'
  | 'sms_not_supported'
  | 'sms_cancelled';

export type SosResult =
  | { ok: true; recipientCount: number; mapsUrl: string; notifiedNgoCount: number }
  | { ok: false; reason: SosFailureReason; mapsUrl?: string; notifiedNgoCount?: number };

const PENDING_SOS_SMS_KEY_PREFIX = 'relieflink_pending_sos_sms';

export type PendingSosSmsPayload = {
  /** Firestore alert id when signed in; omitted for guest-only flow */
  alertId?: string;
  mapsUrl: string;
  userName: string;
  userEmail: string | null;
  userPhone: string;
  savedAtIso: string;
};

function pendingSosSmsKey(userId?: string): string {
  return `${PENDING_SOS_SMS_KEY_PREFIX}:${userId?.trim() || 'guest'}`;
}

export async function savePendingSosSmsPayload(payload: PendingSosSmsPayload, userId?: string): Promise<void> {
  await setItem(pendingSosSmsKey(userId), JSON.stringify(payload));
}

export async function loadPendingSosSmsPayload(userId?: string): Promise<PendingSosSmsPayload | null> {
  const raw = await getItem(pendingSosSmsKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingSosSmsPayload;
    if (!parsed?.mapsUrl || typeof parsed.mapsUrl !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearPendingSosSmsPayload(userId?: string): Promise<void> {
  await removeItem(pendingSosSmsKey(userId));
}

/** Builds a Google Maps link from coordinates (works offline in the SMS body). */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

function normalizePhones(contacts: { phone: string }[]): string[] {
  const raw = contacts.map((c) => c.phone.replace(/\s+/g, '').trim()).filter(Boolean);
  return [...new Set(raw)];
}

export function buildSosSmsBody(input: {
  userName: string;
  userEmail: string | null;
  userPhone: string;
  mapsUrl: string;
}): string {
  const whoLines = [
    `Name: ${input.userName}`,
    input.userEmail ? `Email: ${input.userEmail}` : null,
    input.userPhone ? `Phone: ${input.userPhone}` : null,
  ]
    .filter(Boolean)
    .join('\n');
  return `I am in danger.\n${whoLines}\nLocation: ${input.mapsUrl}`;
}

export type SendPendingSosSmsResult =
  | { status: 'no_pending' }
  | { status: 'opened' }
  | { status: 'cancelled' }
  | { status: 'sms_unavailable'; mapsUrl: string };

/**
 * After the user adds an emergency contact, send the *same* SOS text (same map link / details)
 * to that number only. Does not create another NGO alert.
 */
export async function sendPendingSosSmsToNewContact(
  normalizedPhone: string,
  userId?: string,
): Promise<SendPendingSosSmsResult> {
  const pending = await loadPendingSosSmsPayload(userId);
  if (!pending) return { status: 'no_pending' };

  const phone = normalizedPhone.replace(/\s+/g, '').trim();
  if (!phone) return { status: 'no_pending' };

  const message = buildSosSmsBody({
    userName: pending.userName,
    userEmail: pending.userEmail,
    userPhone: pending.userPhone,
    mapsUrl: pending.mapsUrl,
  });

  const smsOk = await SMS.isAvailableAsync();
  if (!smsOk) {
    return { status: 'sms_unavailable', mapsUrl: pending.mapsUrl };
  }

  const smsResult = await SMS.sendSMSAsync([phone], message);
  if (smsResult.result === 'cancelled') {
    return { status: 'cancelled' };
  }

  await clearPendingSosSmsPayload(userId);
  return { status: 'opened' };
}

/**
 * Runs the SOS pipeline: location → NGO alert (signed-in) → SMS to all saved contacts, or store pending SMS if none.
 */
export async function runSosEmergency(): Promise<SosResult> {
  const user = auth.currentUser;
  const contactsForCurrentUser = await getEmergencyContacts(user?.uid);
  const phones = normalizePhones(contactsForCurrentUser);

  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  let coords: Location.LocationObjectCoords;
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    coords = position.coords;
  } catch {
    return { ok: false, reason: 'location_unavailable' };
  }

  const mapsUrl = buildGoogleMapsUrl(coords.latitude, coords.longitude);
  let profile: Awaited<ReturnType<typeof getUserProfile>> = null;
  if (user) {
    try {
      profile = await getUserProfile(user.uid);
    } catch {
      profile = null;
    }
  }
  const userName = profile?.displayName?.trim() || user?.displayName || user?.email || 'User';
  const userEmail = profile?.email ?? user?.email ?? null;
  const userPhone = profile?.phone?.trim() ?? '';

  const sosEvent = user
    ? await createSosAlert({
        userId: user.uid,
        userName,
        userEmail,
        userPhone,
        latitude: coords.latitude,
        longitude: coords.longitude,
        mapsUrl,
      })
    : { alertId: '', notifiedNgoCount: 0 };

  if (phones.length === 0) {
    await savePendingSosSmsPayload(
      {
        alertId: sosEvent.alertId || undefined,
        mapsUrl,
        userName,
        userEmail,
        userPhone,
        savedAtIso: new Date().toISOString(),
      },
      user?.uid,
    );
    return {
      ok: false,
      reason: 'no_contacts',
      mapsUrl,
      notifiedNgoCount: sosEvent.notifiedNgoCount,
    };
  }

  await clearPendingSosSmsPayload(user?.uid);

  const message = buildSosSmsBody({ userName, userEmail, userPhone, mapsUrl });

  const smsOk = await SMS.isAvailableAsync();
  if (!smsOk) {
    return { ok: false, reason: 'sms_not_supported', mapsUrl, notifiedNgoCount: sosEvent.notifiedNgoCount };
  }

  const smsResult = await SMS.sendSMSAsync(phones, message);

  if (smsResult.result === 'cancelled') {
    return { ok: false, reason: 'sms_cancelled', notifiedNgoCount: sosEvent.notifiedNgoCount };
  }

  return { ok: true, recipientCount: phones.length, mapsUrl, notifiedNgoCount: sosEvent.notifiedNgoCount };
}
