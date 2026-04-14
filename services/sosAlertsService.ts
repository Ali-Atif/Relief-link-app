import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';
import { sendNotification } from './notificationsService';
import { listNgoProfiles } from './userProfiles';

export type SosAlertStatus = 'open' | 'in_chat' | 'resolved';

export type SosAlert = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  ngoId?: string;
  ngoName?: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  status: SosAlertStatus;
  createdAtIso?: string;
};

const SOS_ALERTS_COLLECTION = 'sos_alerts';

function tsToIso(ts: Timestamp | null | undefined): string | undefined {
  if (!ts) return undefined;
  return ts.toDate().toISOString();
}

function mapAlert(snap: QueryDocumentSnapshot<DocumentData>): SosAlert {
  const data = snap.data();
  return {
    id: snap.id,
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? 'User'),
    userEmail: (data.userEmail as string | null | undefined) ?? null,
    ngoId: data.ngoId as string | undefined,
    ngoName: data.ngoName as string | undefined,
    latitude: Number(data.latitude ?? 0),
    longitude: Number(data.longitude ?? 0),
    mapsUrl: String(data.mapsUrl ?? ''),
    status: (data.status as SosAlertStatus) ?? 'open',
    createdAtIso: tsToIso(data.createdAt as Timestamp | null | undefined),
  };
}

export async function createSosAlert(input: {
  userId: string;
  userName: string;
  userEmail: string | null;
  latitude: number;
  longitude: number;
  mapsUrl: string;
}): Promise<{ alertId: string; notifiedNgoCount: number }> {
  const alertRef = await addDoc(collection(db, SOS_ALERTS_COLLECTION), {
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    latitude: input.latitude,
    longitude: input.longitude,
    mapsUrl: input.mapsUrl,
    status: 'open',
    createdAt: serverTimestamp(),
  });

  const ngos = await listNgoProfiles();
  await Promise.all(
    ngos.map((ngo) =>
      sendNotification({
        userId: ngo.uid,
        type: 'sos',
        title: 'New SOS application',
        body: `${input.userName} requested emergency support.`,
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
    status: 'in_chat',
  });
}

export function subscribeLatestSosAlerts(onChange: (items: SosAlert[]) => void): Unsubscribe {
  const q = query(collection(db, SOS_ALERTS_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map(mapAlert));
  });
}

export function subscribeUserSosAlerts(userId: string, onChange: (items: SosAlert[]) => void): Unsubscribe {
  const q = query(collection(db, SOS_ALERTS_COLLECTION), where('userId', '==', userId), limit(40));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map(mapAlert)
      .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''))
      .slice(0, 20);
    onChange(rows);
  });
}

