import { apiClient } from '../../core/api/apiClient';
import type { JiraStatusResponse } from '../../types/api';

export async function getJiraStatus(ticketPublicId: string) {
  return apiClient.get<JiraStatusResponse>(`/tickets/${ticketPublicId}/jira`);
}

export async function createJiraLink(ticketPublicId: string) {
  return apiClient.post<JiraStatusResponse>(`/tickets/${ticketPublicId}/jira/create`);
}

export async function retryJiraLink(ticketPublicId: string) {
  return apiClient.post<JiraStatusResponse>(`/tickets/${ticketPublicId}/jira/retry`);
}
