/**
 * NGO reports: Firestore when online, AsyncStorage queue when offline, sync on reconnect.
 *
 * Validation lives in `ngoReportValidation.ts`. NetInfo rules match `utils/netInfoOnline.ts`.
 */
import NetInfo from '@react-native-community/netinfo';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { isNetStateOnline } from '../utils/netInfoOnline';
import { auth, db } from './firebase';
import { enqueuePendingReport, getPendingNgoReports, removePendingReportByLocalId } from './ngoReportsQueue';
import type { NgoReportPayload } from './ngoReportsTypes';
import { validateNgoReportPayload } from './ngoReportValidation';

const NGO_REPORTS_COLLECTION = 'ngo_reports';

export async function getIsOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return isNetStateOnline(state);
  } catch {
    return false;
  }
}

async function saveToFirestore(p: NgoReportPayload): Promise<void> {
  await addDoc(collection(db, NGO_REPORTS_COLLECTION), {
    title: p.title.trim(),
    description: p.description.trim(),
    location: p.location.trim(),
    createdAt: serverTimestamp(),
    userId: auth.currentUser?.uid ?? null,
  });
}

export type SubmitNgoReportResult =
  | { ok: true; mode: 'submitted_online' }
  | { ok: true; mode: 'queued_offline' };

export async function submitNgoReport(payload: NgoReportPayload): Promise<SubmitNgoReportResult> {
  const validationError = validateNgoReportPayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const online = await getIsOnline();
  if (online) {
    await saveToFirestore(payload);
    return { ok: true, mode: 'submitted_online' };
  }

  await enqueuePendingReport(payload);
  return { ok: true, mode: 'queued_offline' };
}

export type SyncNgoReportsResult = {
  uploaded: number;
  failed: number;
};

/** Uploads all pending local reports when the device has connectivity. */
export async function syncPendingNgoReports(): Promise<SyncNgoReportsResult> {
  if (!(await getIsOnline())) {
    return { uploaded: 0, failed: 0 };
  }

  const pending = await getPendingNgoReports();
  if (pending.length === 0) {
    return { uploaded: 0, failed: 0 };
  }

  let uploaded = 0;
  let failed = 0;

  for (const row of pending) {
    try {
      await saveToFirestore({
        title: row.title,
        description: row.description,
        location: row.location,
      });
      await removePendingReportByLocalId(row.localId);
      uploaded += 1;
    } catch {
      failed += 1;
    }
  }

  return { uploaded, failed };
}

export async function getPendingNgoReportCount(): Promise<number> {
  const pending = await getPendingNgoReports();
  return pending.length;
}
