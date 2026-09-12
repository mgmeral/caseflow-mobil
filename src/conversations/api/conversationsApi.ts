import { apiClient } from '../../core/api/apiClient';
import type { EmailThreadItemResponse } from '../../types/api';

export async function getConversation(caseId: string) {
  return apiClient.get<EmailThreadItemResponse[]>(`/tickets/${caseId}/email/thread`);
}
