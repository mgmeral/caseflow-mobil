import { apiClient } from '../../core/api/apiClient';
import type {
  AllowedTransitionsResponse,
  CaseDetail,
  CaseListResponse,
  TicketDetailResponse,
  TicketSummaryResponse,
} from '../../types/api';

export type SlaFilterState = 'BREACHED' | 'AT_RISK';
export type TicketSortField = 'updatedAt' | 'createdAt' | 'status' | 'priority';

export interface CaseFilters {
  search?: string;
  openOnly?: boolean;
  unassignedOnly?: boolean;
  /** Open with no status change for 24 h — the dashboard's "Open > 24h". */
  overdueOnly?: boolean;
  status?: string;
  priority?: string;
  /** Filters to tickets whose assignedUserId equals this id — "assigned to me" when passed the current user's id. */
  assignedUserId?: number;
  groupId?: number;
  tagId?: number;
  customerId?: number;
  slaState?: SlaFilterState;
  /** yyyy-MM-dd, inclusive. */
  dateFrom?: string | null;
  dateTo?: string | null;
  sort?: TicketSortField;
  direction?: 'asc' | 'desc';
}

// Parameter names are the ones TicketController.listTickets actually reads.
export function buildCasesQuery(page: number, filters: CaseFilters = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: '20',
    sort: filters.sort ?? 'createdAt',
    direction: filters.direction ?? 'desc',
  });

  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.openOnly) params.set('openOnly', 'true');
  if (filters.unassignedOnly) params.set('unassignedOnly', 'true');
  if (filters.overdueOnly) params.set('staleOpenOverHours', '24');
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assignedUserId != null) params.set('userId', String(filters.assignedUserId));
  if (filters.groupId != null) params.set('groupId', String(filters.groupId));
  if (filters.tagId != null) params.set('tagId', String(filters.tagId));
  if (filters.customerId != null) params.set('customerId', String(filters.customerId));
  if (filters.slaState) params.set('slaState', filters.slaState);
  if (filters.dateFrom) params.set('from', `${filters.dateFrom}T00:00:00.000Z`);
  if (filters.dateTo) params.set('to', `${filters.dateTo}T23:59:59.999Z`);

  return params.toString();
}

export async function getCases(page: number, filters: CaseFilters = {}) {
  const response = await apiClient.get<CaseListResponse<TicketSummaryResponse>>(`/tickets?${buildCasesQuery(page, filters)}`);
  return response;
}

export async function getCaseDetail(caseId: string) {
  return apiClient.get<TicketDetailResponse>(`/tickets/${caseId}/detail`);
}

export async function getCaseTransitions(caseId: string) {
  return apiClient.get<AllowedTransitionsResponse>(`/tickets/${caseId}/transitions`);
}

export async function changeCaseStatus(caseId: string, status: string) {
  return apiClient.post<TicketSummaryResponse>(`/tickets/${caseId}/status`, { status });
}

export function mapCaseDetail(response: TicketDetailResponse): CaseDetail {
  return {
    id: String(response.id),
    publicId: response.publicId ?? null,
    ticketNo: response.ticketNo,
    subject: response.subject,
    description: response.description ?? null,
    status: response.status,
    priority: response.priority,
    customerId: response.customerId ?? null,
    customerName: response.customerName ?? 'Unknown customer',
    assignedUserId: response.assignedUserId ?? null,
    assignedUserName: response.assignedUserName ?? null,
    assignedGroupId: response.assignedGroupId ?? null,
    assignedGroupName: response.assignedGroupName ?? null,
    resolutionDueAt: response.sla?.resolutionDueAt ?? response.resolutionDueAt ?? null,
    firstResponseDueAt: response.sla?.firstResponseDueAt ?? response.firstResponseDueAt ?? null,
    slaState: response.sla?.state ?? response.slaState ?? null,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    attachments: response.attachments ?? [],
    history: response.history ?? [],
  };
}
