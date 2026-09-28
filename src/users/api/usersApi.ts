import { apiClient } from '../../core/api/apiClient';
import type { PagedResponse, UserSummaryResponse } from '../../types/api';

// GET /users is paged (default 20) and needs USER_READ or USER_MANAGE. Pickers need everyone.
export async function getUsers() {
  const response = await apiClient.get<PagedResponse<UserSummaryResponse>>('/users?size=1000&sort=username');
  return response.items;
}
