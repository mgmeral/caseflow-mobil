import { apiClient } from '../../core/api/apiClient';
import type { AssignmentResponse } from '../../types/api';

export async function assignTicket(ticketId: string, assignedUserId?: number | null, assignedGroupId?: number | null) {
  return apiClient.post<AssignmentResponse>('/assignments/assign', {
    ticketId: Number(ticketId),
    assignedUserId: assignedUserId ?? null,
    assignedGroupId: assignedGroupId ?? null,
  });
}

export async function unassignTicket(ticketId: string) {
  return apiClient.post<void>('/assignments/unassign', { ticketId: Number(ticketId) });
}
