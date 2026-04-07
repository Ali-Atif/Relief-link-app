import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NgoReportPayload, PendingNgoReport } from './ngoReportsTypes';

const STORAGE_KEY = 'relieflink_pending_ngo_reports';

function newLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function getPendingNgoReports(): Promise<PendingNgoReport[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null || raw === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is PendingNgoReport =>
        item != null &&
        typeof item === 'object' &&
        'localId' in item &&
        'status' in item &&
        (item as PendingNgoReport).status === 'pending',
    );
  } catch {
    return [];
  }
}

export async function enqueuePendingReport(payload: NgoReportPayload): Promise<PendingNgoReport> {
  const pending: PendingNgoReport = {
    ...payload,
    localId: newLocalId(),
    status: 'pending',
    createdAtIso: new Date().toISOString(),
  };
  const existing = await getPendingNgoReports();
  existing.push(pending);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return pending;
}

export async function removePendingReportByLocalId(localId: string): Promise<void> {
  const existing = await getPendingNgoReports();
  const next = existing.filter((r) => r.localId !== localId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
