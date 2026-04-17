import type { AnySosAlertStatus } from '../services/sosAlertsService';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function displaySosStatus(status: AnySosAlertStatus, t: TFn): string {
  switch (status) {
    case 'open':
    case 'pending':
      return t('sosStatus.pending');
    case 'in_chat':
    case 'in_progress':
      return t('sosStatus.in_progress');
    case 'resolved':
      return t('sosStatus.resolved');
    default:
      return status;
  }
}
