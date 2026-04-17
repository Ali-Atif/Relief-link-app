import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from './firebase';
import { getChatThreadId, parseChatThreadId } from './chatThreadIds';
import { sendNotification } from './notificationsService';
import { getSosAlertById, normalizeToModernStatus } from './sosAlertsService';

export type ChatThread = {
  id: string;
  alertId: string;
  userId: string;
  ngoId: string;
  createdAtIso?: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAtIso?: string;
};

export type AlertChatThreadRow = {
  threadId: string;
  ngoId: string;
  ngoName: string;
};

const CHATS_COLLECTION = 'chats';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

function tsToIso(ts: Timestamp | null | undefined): string | undefined {
  if (!ts) return undefined;
  return ts.toDate().toISOString();
}

function mapMessage(snap: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = snap.data();
  return {
    id: snap.id,
    chatId: String(data.chatId ?? ''),
    senderId: String(data.senderId ?? ''),
    senderName: String(data.senderName ?? 'Member'),
    text: String(data.text ?? ''),
    createdAtIso: tsToIso(data.createdAt as Timestamp | null | undefined),
  };
}

/**
 * Ensures a dedicated `chats/{alertId}__{ngoId}` thread exists for this NGO.
 * Does not change SOS status (that remains explicit "Mark in progress").
 */
export async function ensureChatForAlert(input: {
  alertId: string;
  userId: string;
  ngoId: string;
  ngoName: string;
  userName: string;
}): Promise<ChatThread> {
  const alert = await getSosAlertById(input.alertId);
  if (!alert) {
    throw new Error('ALERT_NOT_FOUND');
  }
  const normStatus = normalizeToModernStatus(alert.status);
  if (normStatus === 'resolved') {
    throw new Error('ALERT_ALREADY_RESOLVED');
  }

  const assignedOnAlert = String(alert.ngoId ?? '');
  if (normStatus === 'in_progress' && assignedOnAlert && assignedOnAlert !== input.ngoId) {
    throw new Error('ALERT_ALREADY_ASSIGNED');
  }

  const threadId = getChatThreadId(input.alertId, input.ngoId);
  const chatRef = doc(db, CHATS_COLLECTION, threadId);
  const existing = await getDoc(chatRef);

  if (existing.exists()) {
    const data = existing.data();
    return {
      id: threadId,
      alertId: input.alertId,
      userId: String(data?.userId ?? input.userId),
      ngoId: String(data?.ngoId ?? input.ngoId),
    };
  }

  await setDoc(chatRef, {
    alertId: input.alertId,
    userId: input.userId,
    ngoId: input.ngoId,
    ngoName: input.ngoName.trim() || 'NGO',
    openAccess: normStatus === 'pending',
    createdAt: serverTimestamp(),
  });

  return {
    id: threadId,
    alertId: input.alertId,
    userId: input.userId,
    ngoId: input.ngoId,
  };
}

export async function sendChatMessage(input: {
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
}): Promise<void> {
  const cleanText = input.text.trim();
  if (!cleanText) return;

  await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
    chatId: input.chatId,
    senderId: input.senderId,
    senderName: input.senderName,
    text: cleanText,
    createdAt: serverTimestamp(),
  });

  const parsed = parseChatThreadId(input.chatId);
  const alertIdForNotify = parsed?.alertId ?? input.chatId;

  await sendNotification({
    userId: input.receiverId,
    type: 'chat',
    title: 'New chat message',
    body: `${input.senderName}: ${cleanText}`,
    chatId: input.chatId,
    alertId: alertIdForNotify,
  });
}

export function subscribeChatMessages(
  chatId: string,
  onChange: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const q = query(collection(db, CHAT_MESSAGES_COLLECTION), where('chatId', '==', chatId), limit(200));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs
      .map(mapMessage)
      .sort((a, b) => (a.createdAtIso ?? '').localeCompare(b.createdAtIso ?? ''));
    onChange(messages);
  });
}

/** SOS threads for this alert where the survivor is the listed user (parallel NGO conversations). */
export function subscribeChatThreadsForAlertUser(
  alertId: string,
  survivorUserId: string,
  onChange: (threads: AlertChatThreadRow[]) => void,
): Unsubscribe {
  const q = query(collection(db, CHATS_COLLECTION), where('alertId', '==', alertId), limit(30));
  return onSnapshot(q, (snap) => {
    const threads: AlertChatThreadRow[] = [];
    for (const d of snap.docs) {
      const data = d.data();
      if (String(data.userId ?? '') !== survivorUserId) continue;
      const ngoId = String(data.ngoId ?? '');
      if (!ngoId) continue;
      threads.push({
        threadId: d.id,
        ngoId,
        ngoName: String(data.ngoName ?? 'NGO'),
      });
    }
    onChange(threads);
  });
}
