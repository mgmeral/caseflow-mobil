import { apiClient } from '../../core/api/apiClient';
import type { ScheduleEmailRequest, ScheduledEmailResponse } from '../../types/api';

// This endpoint group is keyed by the ticket's publicId (UUID), not its numeric id (ADR-0003).
export async function getScheduledEmails(ticketPublicId: string) {
  return apiClient.get<ScheduledEmailResponse[]>(`/tickets/${ticketPublicId}/scheduled-emails`);
}

export async function scheduleEmail(ticketPublicId: string, request: ScheduleEmailRequest) {
  return apiClient.post<ScheduledEmailResponse>(`/tickets/${ticketPublicId}/scheduled-emails`, request);
}

/** Returns the canceled record (200), not an empty 204. */
export async function cancelScheduledEmail(ticketPublicId: string, dispatchId: number) {
  return apiClient.delete<ScheduledEmailResponse>(`/tickets/${ticketPublicId}/scheduled-emails/${dispatchId}`);
}
