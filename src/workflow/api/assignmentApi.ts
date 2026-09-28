import { apiClient } from '../../core/api/apiClient';
import { ApiError } from '../../core/api/http';
import type { AssignmentResponse } from '../../types/api';

export async function assignTicket(ticketId: string, assignedUserId?: number | null, assignedGroupId?: number | null) {
  return apiClient.post<AssignmentResponse>('/assignments/assign', {
    ticketId: Number(ticketId),
    assignedUserId: assignedUserId ?? null,
    assignedGroupId: assignedGroupId ?? null,
  });
}

export async function reassignTicket(ticketId: string, newUserId?: number | null, newGroupId?: number | null) {
  return apiClient.post<AssignmentResponse>('/assignments/reassign', {
    ticketId: Number(ticketId),
    ...(newUserId != null ? { newUserId } : {}),
    ...(newGroupId != null ? { newGroupId } : {}),
  });
}

/** Same as caseflow-fe's assignmentService.assignOrReassign: assign, or reassign when the ticket already has an owner. */
export async function assignOrReassignTicket(ticketId: string, userId: number) {
  try {
    return await assignTicket(ticketId, userId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409 && error.code === 'ASSIGNMENT_CONFLICT') {
      return reassignTicket(ticketId, userId);
    }
    throw error;
  }
}

export async function unassignTicket(ticketId: string) {
  return apiClient.post<void>('/assignments/unassign', { ticketId: Number(ticketId) });
}
