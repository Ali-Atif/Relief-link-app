export type NgoReportPayload = {
  title: string;
  description: string;
  location: string;
};

/** Stored locally when offline; uploaded when sync runs. */
export type PendingNgoReport = NgoReportPayload & {
  localId: string;
  status: 'pending';
  createdAtIso: string;
};
