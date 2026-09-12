import { apiClient } from '../../core/api/apiClient';
import type { CustomerSummaryResponse, PagedResponse } from '../../types/api';

export async function getCustomers(page: number) {
  return apiClient.get<PagedResponse<CustomerSummaryResponse>>(`/customers?page=${page}&size=20`);
}
