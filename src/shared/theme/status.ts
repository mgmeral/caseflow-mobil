import { colors } from './colors';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'outline';

export const badgeVariantStyles: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  default: { bg: colors.neutralMuted, border: colors.border, text: colors.muted },
  success: { bg: colors.successMuted, border: colors.successBorder, text: colors.successText },
  error: { bg: colors.errorMuted, border: colors.errorBorder, text: colors.errorText },
  warning: { bg: colors.warningMuted, border: colors.warningBorder, text: colors.warningText },
  info: { bg: colors.infoMuted, border: colors.infoBorder, text: colors.infoText },
  outline: { bg: colors.surface, border: colors.borderStrong, text: colors.muted },
};

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeKey(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

// Mirrors caseflow-fe's TicketStatusBadge STATUS_CONFIG
// (src/components/tickets/TicketStatusBadge.tsx) so status pills read the
// same on both clients.
const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  NEW: { label: 'New', variant: 'info' },
  TRIAGED: { label: 'Triaged', variant: 'warning' },
  ASSIGNED: { label: 'Assigned', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info' },
  WAITING_CUSTOMER: { label: 'Waiting Customer', variant: 'default' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'outline' },
  REOPENED: { label: 'Reopened', variant: 'warning' },
  OPEN: { label: 'Assigned', variant: 'warning' },
  PENDING: { label: 'Waiting Customer', variant: 'default' },
  TRANSFERRED: { label: 'Assigned', variant: 'warning' },
};

export function getStatusConfig(status?: string | null): { label: string; variant: BadgeVariant } {
  if (!status) {
    return { label: 'Unknown', variant: 'outline' };
  }
  const key = normalizeKey(status);
  return STATUS_CONFIG[key] ?? { label: toTitleCase(status), variant: 'default' };
}

// Mirrors caseflow-fe's PriorityBadge PRIORITY_CONFIG
// (src/components/tickets/PriorityBadge.tsx) — priority gets its own
// red/orange/amber/gray ramp rather than the generic Badge variants.
const PRIORITY_CONFIG: Record<string, { label: string; bg: string; border: string; text: string }> = {
  CRITICAL: { label: 'Critical', bg: colors.errorMuted, border: colors.errorBorder, text: colors.errorText },
  HIGH: { label: 'High', bg: colors.orangeMuted, border: colors.orangeBorder, text: colors.orangeText },
  MEDIUM: { label: 'Medium', bg: colors.warningMuted, border: colors.warningBorder, text: colors.warningText },
  LOW: { label: 'Low', bg: colors.neutralMuted, border: colors.border, text: colors.muted },
};

const DEFAULT_PRIORITY = { bg: colors.neutralMuted, border: colors.border, text: colors.muted };

export function getPriorityConfig(priority?: string | null): { label: string; bg: string; border: string; text: string } {
  if (!priority) {
    return { label: 'Unknown', ...DEFAULT_PRIORITY };
  }
  const key = normalizeKey(priority);
  return PRIORITY_CONFIG[key] ?? { label: toTitleCase(priority), ...DEFAULT_PRIORITY };
}

export function getSlaConfig(slaState?: string | null): { label: string; variant: BadgeVariant } | null {
  if (!slaState) {
    return null;
  }
  const key = normalizeKey(slaState);
  if (key.includes('BREACH')) {
    return { label: toTitleCase(slaState), variant: 'error' };
  }
  if (key.includes('RISK') || key.includes('WARN')) {
    return { label: toTitleCase(slaState), variant: 'warning' };
  }
  if (key.includes('OK') || key.includes('SAFE') || key.includes('ON_TRACK')) {
    return { label: toTitleCase(slaState), variant: 'success' };
  }
  return { label: toTitleCase(slaState), variant: 'default' };
}
