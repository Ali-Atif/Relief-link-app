/**
 * NGO report form validation (shared rules for Firestore + offline queue).
 *
 * Returns `null` when all fields are OK, otherwise an English message for errors
 * (shown in alerts; you can map to i18n later if needed).
 */
import type { NgoReportPayload } from './ngoReportsTypes';

export function validateNgoReportPayload(p: NgoReportPayload): string | null {
  const title = p.title.trim();
  const description = p.description.trim();
  const location = p.location.trim();
  if (!title) {
    return 'Title is required.';
  }
  if (!description) {
    return 'Description is required.';
  }
  if (!location) {
    return 'Location is required.';
  }
  return null;
}
