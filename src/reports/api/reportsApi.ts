import { apiClient } from '../../core/api/apiClient';
import type { AdminCustomerReportRow, CustomerTicketReportResponse, PagedResponse } from '../../types/api';
import { buildReportQuery, type ReportDateRange } from '../utils/dateRange';

export async function getCustomerReport(customerId: string, range: ReportDateRange) {
  return apiClient.get<CustomerTicketReportResponse>(`/customers/${customerId}/reports/tickets${buildReportQuery(range)}`);
}

export async function getAdminAggregateReport(page: number, size: number, range: ReportDateRange) {
  return apiClient.get<PagedResponse<AdminCustomerReportRow>>(
    `/admin/reports/customers/tickets${buildReportQuery(range, { page: String(page), size: String(size) })}`,
  );
}
