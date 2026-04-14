/**
 * SOS flow: load saved emergency contacts → request GPS → open SMS with location link.
 * Used by `useSosEmergency` / `SosButton` on the home screen.
 */

import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

import { auth } from './firebase';
import { getEmergencyContacts } from './emergencyContactsStorage';
import { createSosAlert } from './sosAlertsService';

export type SosFailureReason =
  | 'no_contacts'
  | 'permission_denied'
  | 'location_unavailable'
  | 'sms_not_supported'
  | 'sms_cancelled';

export type SosResult =
  | { ok: true; recipientCount: number; mapsUrl: string; notifiedNgoCount: number }
  | { ok: false; reason: SosFailureReason; mapsUrl?: string; notifiedNgoCount?: number };

/** Builds a Google Maps link from coordinates (works offline in the SMS body). */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

function normalizePhones(contacts: { phone: string }[]): string[] {
  const raw = contacts.map((c) => c.phone.replace(/\s+/g, '').trim()).filter(Boolean);
  return [...new Set(raw)];
}

/**
 * Runs the SOS pipeline: contacts (offline) → location → SMS composer.
 * Order is optimized: fail fast if there are no saved contacts before using GPS.
 */
export async function runSosEmergency(): Promise<SosResult> {
  const contacts = await getEmergencyContacts();
  const phones = normalizePhones(contacts);

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
  const user = auth.currentUser;
  const sosEvent = user
    ? await createSosAlert({
        userId: user.uid,
        userName: user.displayName ?? user.email ?? 'User',
        userEmail: user.email,
        latitude: coords.latitude,
        longitude: coords.longitude,
        mapsUrl,
      })
    : { alertId: '', notifiedNgoCount: 0 };

  if (phones.length === 0) {
    return { ok: false, reason: 'no_contacts', mapsUrl, notifiedNgoCount: sosEvent.notifiedNgoCount };
  }

  const message = `I am in danger. My location: ${mapsUrl}`;

  const smsOk = await SMS.isAvailableAsync();
  if (!smsOk) {
    // Location already known — include link so the user can copy/share manually.
    return { ok: false, reason: 'sms_not_supported', mapsUrl, notifiedNgoCount: sosEvent.notifiedNgoCount };
  }

  const smsResult = await SMS.sendSMSAsync(phones, message);

  if (smsResult.result === 'cancelled') {
    return { ok: false, reason: 'sms_cancelled', notifiedNgoCount: sosEvent.notifiedNgoCount };
  }

  // Android often returns 'unknown' even when the user sent the message — treat as success.
  return { ok: true, recipientCount: phones.length, mapsUrl, notifiedNgoCount: sosEvent.notifiedNgoCount };
}
