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
import { sendNotification } from './notificationsService';
import { assignNgoToSosAlert } from './sosAlertsService';

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

export async function ensureChatForAlert(input: {
  alertId: string;
  userId: string;
  ngoId: string;
  ngoName: string;
  userName: string;
}): Promise<ChatThread> {
  const chatId = input.alertId;
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const existing = await getDoc(chatRef);
  if (!existing.exists()) {
    await setDoc(chatRef, {
      alertId: input.alertId,
      userId: input.userId,
      ngoId: input.ngoId,
      createdAt: serverTimestamp(),
    });
    await assignNgoToSosAlert(input.alertId, input.ngoId, input.ngoName);
    await sendNotification({
      userId: input.userId,
      type: 'chat',
      title: 'NGO started chat',
      body: `${input.ngoName} started helping you in chat.`,
    });
  }

  return {
    id: chatId,
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

  await sendNotification({
    userId: input.receiverId,
    type: 'chat',
    title: 'New chat message',
    body: `${input.senderName}: ${cleanText}`,
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
