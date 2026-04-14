import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
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

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'sos' | 'chat' | 'system';
  createdAtIso?: string;
  read: boolean;
};

const NOTIFICATIONS_COLLECTION = 'notifications';

function tsToIso(ts: Timestamp | null | undefined): string | undefined {
  if (!ts) return undefined;
  return ts.toDate().toISOString();
}

function mapNotification(snap: QueryDocumentSnapshot<DocumentData>): AppNotification {
  const data = snap.data();
  return {
    id: snap.id,
    userId: String(data.userId ?? ''),
    title: String(data.title ?? 'Notification'),
    body: String(data.body ?? ''),
    type: (data.type as AppNotification['type']) ?? 'system',
    createdAtIso: tsToIso(data.createdAt as Timestamp | null | undefined),
    read: Boolean(data.read),
  };
}

export async function sendNotification(input: {
  userId: string;
  title: string;
  body: string;
  type: AppNotification['type'];
}): Promise<void> {
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeNotifications(
  userId: string,
  onChange: (items: AppNotification[]) => void,
): Unsubscribe {
  const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId), limit(40));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map(mapNotification)
      .sort((a, b) => (b.createdAtIso ?? '').localeCompare(a.createdAtIso ?? ''))
      .slice(0, 25);
    onChange(rows);
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true });
}
