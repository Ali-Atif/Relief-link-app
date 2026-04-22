import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { getChatThreadId } from './chatThreadIds';
import { db } from './firebase';
import { sendNotification } from './notificationsService';
import { listNgoProfiles } from './userProfiles';

export type SosAlertStatus = 'pending' | 'in_progress' | 'resolved';
export type LegacySosAlertStatus = 'open' | 'in_chat';
export type AnySosAlertStatus = SosAlertStatus | LegacySosAlertStatus;
export type SosClaimResult =
  | { ok: true }
  | { ok: false; reason: 'already_resolved' | 'claimed_by_other_ngo' };

export type SosAlert = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhone?: string;
  ngoId?: string;
  ngoName?: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  status: AnySosAlertStatus;
  createdAtIso?: string;
};

const SOS_ALERTS_COLLECTION = 'sos_alerts';

function tsToIso(ts: Timestamp | null | undefined): string | undefined {
  if (!ts) return undefined;
  return ts.toDate().toISOString();
}

function mapAlert(snap: QueryDocumentSnapshot<DocumentData>): SosAlert {
  const data = snap.data();
  const createdAtIso = tsToIso(data.createdAt as Timestamp | null | undefined) ?? String(data.createdAtClientIso ?? '');
  return {
    id: snap.id,
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? 'User'),
    userEmail: (data.userEmail as string | null | undefined) ?? null,
    userPhone: (data.userPhone as string | undefined) ?? undefined,
    ngoId: data.ngoId as string | undefined,
    ngoName: data.ngoName as string | undefined,
    latitude: Number(data.latitude ?? 0),
    longitude: Number(data.longitude ?? 0),
    mapsUrl: String(data.mapsUrl ?? ''),
    status: (data.status as AnySosAlertStatus) ?? 'pending',
    createdAtIso,
  };
}

export async function getSosAlertById(alertId: string): Promise<SosAlert | null> {
  const snap = await getDoc(doc(db, SOS_ALERTS_COLLECTION, alertId));
  if (!snap.exists()) return null;
  return mapAlert(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function createSosAlert(input: {
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhone: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
}): Promise<{ alertId: string; notifiedNgoCount: number }> {
  const alertRef = await addDoc(collection(db, SOS_ALERTS_COLLECTION), {
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    userPhone: input.userPhone.trim() || null,
    latitude: input.latitude,
    longitude: input.longitude,
    mapsUrl: input.mapsUrl,
    status: 'pending',
    createdAtClientIso: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });

  const phoneLine = input.userPhone.trim() ? `Phone: ${input.userPhone.trim()}` : 'Phone: —';
  const emailLine = input.userEmail?.trim() ? `Email: ${input.userEmail.trim()}` : 'Email: —';
  const notifyBody = `${input.userName} · ${emailLine} · ${phoneLine}`;

  const ngos = await listNgoProfiles();
  await Promise.all(
    ngos.map((ngo) =>
      sendNotification({
        userId: ngo.uid,
        type: 'sos',
        title: 'New SOS application',
        body: notifyBody,
      }),
    ),
  );

  return { alertId: alertRef.id, notifiedNgoCount: ngos.length };
}

export async function updateSosAlertStatus(alertId: string, status: SosAlertStatus): Promise<void> {
  await updateDoc(doc(db, SOS_ALERTS_COLLECTION, alertId), { status });
}

export async function assignNgoToSosAlert(
  alertId: string,
  ngoId: string,
  ngoName: string,
): Promise<void> {
  await updateDoc(doc(db, SOS_ALERTS_COLLECTION, alertId), {
    ngoId,
    ngoName,
    status: 'in_progress',
  });
}

export function normalizeToModernStatus(status: AnySosAlertStatus): SosAlertStatus {
  if (status === 'open') return 'pending';
  if (status === 'in_chat') return 'in_progress';
  return status;
}

export async function markSosAlertInProgress(
  alertId: string,
  ngoId: string,
  ngoName: string,
): Promise<SosClaimResult> {
  const result = await runTransaction(db, async (tx) => {
    const alertRef = doc(db, SOS_ALERTS_COLLECTION, alertId);
    const snap = await tx.get(alertRef);
    if (!snap.exists()) return { ok: false, reason: 'already_resolved' } as const;

    const data = snap.data();
    const status = normalizeToModernStatus((data.status as AnySosAlertStatus) ?? 'pending');
    const assignedNgoId = String(data.ngoId ?? '');
    const userId = String(data.userId ?? '');

    if (status === 'resolved') return { ok: false, reason: 'already_resolved' } as const;
    if (assignedNgoId && assignedNgoId !== ngoId) return { ok: false, reason: 'claimed_by_other_ngo' } as const;

    tx.update(alertRef, {
      status: 'in_progress',
      ngoId,
      ngoName,
      updatedAt: serverTimestamp(),
    });

    if (!assignedNgoId || assignedNgoId !== ngoId) {
      void sendNotification({
        userId,
        type: 'chat',
        title: 'NGO started support',
        body: `${ngoName} started helping you.`,
        chatId: getChatThreadId(alertId, ngoId),
        alertId,
      });
    }
    return { ok: true } as const;
  });

  if (result.ok) {
    try {
      await updateDoc(doc(db, 'chats', getChatThreadId(alertId, ngoId)), {
        openAccess: false,
      });
    } catch {
      /* dedicated thread may not exist yet */
    }
  }

  return result;
}

export async function markSosAlertResolved(alertId: string, ngoId: string): Promise<SosClaimResult> {
  return runTransaction(db, async (tx) => {
    const alertRef = doc(db, SOS_ALERTS_COLLECTION, alertId);
    const snap = await tx.get(alertRef);
    if (!snap.exists()) return { ok: false, reason: 'already_resolved' } as const;

    const data = snap.data();
    const status = normalizeToModernStatus((data.status as AnySosAlertStatus) ?? 'pending');
    const assignedNgoId = String(data.ngoId ?? '');
    if (status === 'resolved') return { ok: false, reason: 'already_resolved' } as const;
    if (assignedNgoId && assignedNgoId !== ngoId) return { ok: false, reason: 'claimed_by_other_ngo' } as const;

    tx.update(alertRef, {
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });
    return { ok: true } as const;
  });
}

export async function rerequestSosAlert(alertId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const alertRef = doc(db, SOS_ALERTS_COLLECTION, alertId);
    const snap = await tx.get(alertRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (String(data.userId ?? '') !== userId) return;

    const status = normalizeToModernStatus((data.status as AnySosAlertStatus) ?? 'pending');
    if (status !== 'in_progress') return;

    tx.update(alertRef, {
      status: 'pending',
      ngoId: null,
      ngoName: null,
      updatedAt: serverTimestamp(),
    });
  });
}

export function subscribeLatestSosAlerts(onChange: (items: SosAlert[]) => void): Unsubscribe {
  const q = query(collection(db, SOS_ALERTS_COLLECTION), limit(80));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map(mapAlert)
      .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''))
      .slice(0, 50);
    onChange(rows);
  });
}

const USER_SOS_HISTORY_LIMIT = 500;

/**
 * Listens to this user's SOS docs. Uses `where` + `limit` only (no composite index).
 * Results are sorted by `createdAt` on the client. If you ever need strict ordering
 * for users with 500+ alerts, add a composite index and use `orderBy('createdAt', 'desc')`.
 */
export function subscribeUserSosAlerts(userId: string, onChange: (items: SosAlert[]) => void): Unsubscribe {
  const q = query(
    collection(db, SOS_ALERTS_COLLECTION),
    where('userId', '==', userId),
    limit(USER_SOS_HISTORY_LIMIT),
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map(mapAlert)
      .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''));
    onChange(rows);
  });
}

