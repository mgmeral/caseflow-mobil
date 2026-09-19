import { apiClient } from '../../core/api/apiClient';
import type { TagResponse, TicketTagResponse } from '../../types/api';

export async function getActiveTags() {
  return apiClient.get<TagResponse[]>('/tags');
}

export async function getTicketTags(ticketId: string) {
  return apiClient.get<TicketTagResponse[]>(`/tickets/${ticketId}/tags`);
}

export async function addTagToTicket(ticketId: string, tagId: number) {
  return apiClient.post<TicketTagResponse>(`/tickets/${ticketId}/tags/${tagId}`);
}

export async function removeTagFromTicket(ticketId: string, tagId: number) {
  return apiClient.delete<void>(`/tickets/${ticketId}/tags/${tagId}`);
}
