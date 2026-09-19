import { apiClient } from '../../core/api/apiClient';
import type { GroupSummaryResponse } from '../../types/api';

export async function getGroups() {
  return apiClient.get<GroupSummaryResponse[]>('/groups');
}
