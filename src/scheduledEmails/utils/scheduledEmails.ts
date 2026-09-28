import type { BadgeVariant } from '../../shared/theme/status';
import type { ScheduledEmailResponse } from '../../types/api';

const FINAL_STATUSES = ['SENT', 'DELIVERED', 'FAILED', 'PERMANENTLY_FAILED', 'CANCELED'];

// Same pending/history split and status colors as caseflow-fe's ScheduledEmailsCard.
export function splitScheduledEmails(items: ScheduledEmailResponse[]) {
  return {
    pending: items.filter((item) => !FINAL_STATUSES.includes(item.status)),
    history: items.filter((item) => FINAL_STATUSES.includes(item.status)),
  };
}

export function isCancelable(item: ScheduledEmailResponse) {
  return item.status === 'PENDING' || item.status === 'QUEUED';
}

export function scheduledStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'PENDING':
    case 'QUEUED':
      return 'warning';
    case 'SENDING':
    case 'PROCESSING':
    case 'DISPATCHED':
      return 'info';
    case 'SENT':
    case 'DELIVERED':
      return 'success';
    case 'FAILED':
    case 'PERMANENTLY_FAILED':
      return 'error';
    default:
      return 'default';
  }
}

export type SchedulePreset = 'in1h' | 'in4h' | 'tomorrow9' | 'nextMonday9';

export const SCHEDULE_PRESETS: { value: SchedulePreset; label: string }[] = [
  { value: 'in1h', label: 'In 1 hour' },
  { value: 'in4h', label: 'In 4 hours' },
  { value: 'tomorrow9', label: 'Tomorrow 09:00' },
  { value: 'nextMonday9', label: 'Next Monday 09:00' },
];

/**
 * Mobile offers preset send times instead of caseflow-fe's free datetime input,
 * so no native date-picker dependency is needed. Every preset is in the future.
 */
export function resolveSchedulePreset(preset: SchedulePreset, now = new Date()): Date {
  const result = new Date(now);
  switch (preset) {
    case 'in1h':
      result.setHours(result.getHours() + 1);
      return result;
    case 'in4h':
      result.setHours(result.getHours() + 4);
      return result;
    case 'tomorrow9':
      result.setDate(result.getDate() + 1);
      result.setHours(9, 0, 0, 0);
      return result;
    case 'nextMonday9': {
      const daysUntilMonday = (8 - result.getDay()) % 7 || 7;
      result.setDate(result.getDate() + daysUntilMonday);
      result.setHours(9, 0, 0, 0);
      return result;
    }
  }
}

export function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : '—';
}
