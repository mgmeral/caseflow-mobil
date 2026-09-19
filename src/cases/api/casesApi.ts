import { apiClient } from '../../core/api/apiClient';
import type {
  AllowedTransitionsResponse,
  CaseDetail,
  CaseListResponse,
  TicketDetailResponse,
  TicketSummaryResponse,
} from '../../types/api';

export interface CaseFilters {
  openOnly?: boolean;
  unassignedOnly?: boolean;
  status?: string;
  /** Filters to tickets whose assignedUserId equals this id — "assigned to me" when passed the current user's id. */
  assignedUserId?: number;
  customerId?: number;
}

export function buildCasesQuery(page: number, filters: CaseFilters = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: '20',
    sort: 'createdAt',
    direction: 'desc',
  });

  if (filters.openOnly) params.set('openOnly', 'true');
  if (filters.unassignedOnly) params.set('unassignedOnly', 'true');
  if (filters.status) params.set('status', filters.status);
  if (filters.assignedUserId != null) params.set('userId', String(filters.assignedUserId));
  if (filters.customerId != null) params.set('customerId', String(filters.customerId));

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
