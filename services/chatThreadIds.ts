/** Firestore chat document id: one isolated thread per SOS alert + NGO pair. */
export const CHAT_THREAD_DELIM = '__' as const;

export function getChatThreadId(alertId: string, ngoId: string): string {
  return `${alertId}${CHAT_THREAD_DELIM}${ngoId}`;
}

export function parseChatThreadId(threadId: string): { alertId: string; ngoId: string } | null {
  const idx = threadId.indexOf(CHAT_THREAD_DELIM);
  if (idx <= 0 || idx + CHAT_THREAD_DELIM.length >= threadId.length) return null;
  return {
    alertId: threadId.slice(0, idx),
    ngoId: threadId.slice(idx + CHAT_THREAD_DELIM.length),
  };
}

export function isPerNgoChatThreadId(threadId: string): boolean {
  return threadId.includes(CHAT_THREAD_DELIM);
}
