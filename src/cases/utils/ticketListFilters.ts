import type { CaseFilters, SlaFilterState } from '../api/casesApi';

// The filter set caseflow-fe's ticket list offers (src/components/tickets/TicketFilters.tsx).
export interface TicketListFilters {
  search: string;
  status: string | null;
  priority: string | null;
  assignedUserId: number | null;
  groupId: number | null;
  tagId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  unassignedOnly: boolean;
  overdueOnly: boolean;
  openOnly: boolean;
  slaState: SlaFilterState | null;
}

export const DEFAULT_TICKET_FILTERS: TicketListFilters = {
  search: '',
  status: null,
  priority: null,
  assignedUserId: null,
  groupId: null,
  tagId: null,
  dateFrom: null,
  dateTo: null,
  unassignedOnly: false,
  overdueOnly: false,
  openOnly: false,
  slaState: null,
};

export const TICKET_STATUSES = ['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'REOPENED'];
export const TICKET_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
// FE's BULK_STATUS_OPTIONS (TicketListPage).
export const BULK_STATUS_OPTIONS = ['TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'];

export type DashboardFilterPreset =
  | 'active' | 'unassigned' | 'waiting' | 'resolved' | 'closed' | 'staleOpen24h' | 'slaBreached' | 'slaAtRisk';

// Same presets as caseflow-fe's getDashboardPresetFilters.
export function dashboardPresetFilters(preset: string | undefined | null): TicketListFilters | null {
  const base = DEFAULT_TICKET_FILTERS;
  switch (preset) {
    case 'active':
      return { ...base, openOnly: true };
    case 'unassigned':
      return { ...base, openOnly: true, unassignedOnly: true };
    case 'waiting':
      return { ...base, status: 'WAITING_CUSTOMER' };
    case 'resolved':
      return { ...base, status: 'RESOLVED' };
    case 'closed':
      return { ...base, status: 'CLOSED' };
    case 'staleOpen24h':
      return { ...base, openOnly: true, overdueOnly: true };
    case 'slaBreached':
      return { ...base, openOnly: true, slaState: 'BREACHED' };
    case 'slaAtRisk':
      return { ...base, openOnly: true, slaState: 'AT_RISK' };
    default:
      return null;
  }
}

export function toCaseFilters(filters: TicketListFilters): CaseFilters {
  return {
    search: filters.search || undefined,
    status: filters.status ?? undefined,
    priority: filters.priority ?? undefined,
    assignedUserId: filters.assignedUserId ?? undefined,
    groupId: filters.groupId ?? undefined,
    tagId: filters.tagId ?? undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    unassignedOnly: filters.unassignedOnly,
    overdueOnly: filters.overdueOnly,
    openOnly: filters.openOnly,
    slaState: filters.slaState ?? undefined,
  };
}

export interface ActiveFilterTag {
  key: string;
  label: string;
  clear: Partial<TicketListFilters>;
}

interface LabelLookups {
  statusLabel: (status: string) => string;
  priorityLabel: (priority: string) => string;
  userName: (id: number) => string | undefined;
  groupName: (id: number) => string | undefined;
  tagName: (id: number) => string | undefined;
}

// The removable chips FE shows under its filter bar, in the same order.
export function activeFilterTags(filters: TicketListFilters, lookups: LabelLookups): ActiveFilterTag[] {
  const tags: ActiveFilterTag[] = [];
  if (filters.status) tags.push({ key: 'status', label: `Status: ${lookups.statusLabel(filters.status)}`, clear: { status: null } });
  if (filters.priority) tags.push({ key: 'priority', label: `Priority: ${lookups.priorityLabel(filters.priority)}`, clear: { priority: null } });
  if (filters.assignedUserId != null) {
    tags.push({ key: 'assignee', label: `Assignee: ${lookups.userName(filters.assignedUserId) ?? `#${filters.assignedUserId}`}`, clear: { assignedUserId: null } });
  }
  if (filters.groupId != null) {
    tags.push({ key: 'group', label: `Group: ${lookups.groupName(filters.groupId) ?? `#${filters.groupId}`}`, clear: { groupId: null } });
  }
  if (filters.tagId != null) tags.push({ key: 'tag', label: `Tag: ${lookups.tagName(filters.tagId) ?? `#${filters.tagId}`}`, clear: { tagId: null } });
  if (filters.unassignedOnly) tags.push({ key: 'unassigned', label: 'Unassigned Only', clear: { unassignedOnly: false } });
  if (filters.overdueOnly) tags.push({ key: 'overdue', label: 'Overdue Only', clear: { overdueOnly: false } });
  if (filters.openOnly) tags.push({ key: 'open', label: 'Open Only', clear: { openOnly: false } });
  if (filters.slaState === 'BREACHED') tags.push({ key: 'sla', label: 'SLA Breached', clear: { slaState: null } });
  if (filters.slaState === 'AT_RISK') tags.push({ key: 'sla', label: 'SLA At Risk', clear: { slaState: null } });
  if (filters.dateFrom || filters.dateTo) tags.push({ key: 'date', label: 'Date Range', clear: { dateFrom: null, dateTo: null } });
  return tags;
}

// caseflow-fe AgingIndicator: how long a ticket has been open, coloured by age.
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

export type AgingTone = 'fresh' | 'aging' | 'old' | 'stale';

export function agingTone(minutes: number, slaBreached: boolean): AgingTone {
  if (slaBreached) return 'stale';
  if (minutes < 240) return 'fresh';
  if (minutes < 480) return 'aging';
  if (minutes < 1440) return 'old';
  return 'stale';
}

export function openMinutes(createdAt: string, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(createdAt).getTime()) / 60000));
}
