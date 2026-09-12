import { apiClient } from '../../core/api/apiClient';
import type { DashboardStatsResponse } from '../../types/api';

export async function getDashboardStats() {
  return apiClient.get<DashboardStatsResponse>('/dashboard/stats');
}
