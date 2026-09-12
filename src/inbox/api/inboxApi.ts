import { apiClient } from '../../core/api/apiClient';
import type { PagedResponse, QueueStatsResponse, TicketSummaryResponse } from '../../types/api';

export async function getInboxQueue(page: number) {
  return apiClient.get<PagedResponse<TicketSummaryResponse>>(`/queue?page=${page}&size=20&sort=createdAt&direction=asc`);
}

export async function getInboxStats() {
  return apiClient.get<QueueStatsResponse>('/queue/stats');
}
