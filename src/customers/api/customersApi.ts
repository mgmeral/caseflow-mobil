import { apiClient } from '../../core/api/apiClient';
import type { ContactSummaryResponse, CustomerResponse, CustomerSummaryResponse, PagedResponse } from '../../types/api';

export async function getCustomers(page: number) {
  return apiClient.get<PagedResponse<CustomerSummaryResponse>>(`/customers?page=${page}&size=20`);
}

export async function getCustomerById(customerId: string) {
  return apiClient.get<CustomerResponse>(`/customers/${customerId}`);
}

export async function getContactsByCustomer(customerId: string) {
  return apiClient.get<ContactSummaryResponse[]>(`/contacts/by-customer/${customerId}`);
}
