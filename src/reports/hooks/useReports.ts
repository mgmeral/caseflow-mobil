import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAdminAggregateReport, getCustomerReport } from '../api/reportsApi';
import type { ReportDateRange } from '../utils/dateRange';

export function useCustomerReport(customerId: string, range: ReportDateRange, enabled = true) {
  return useQuery({
    queryKey: ['customer-report', customerId, range.dateFrom, range.dateTo],
    queryFn: () => getCustomerReport(customerId, range),
    enabled: enabled && Boolean(customerId),
  });
}

export function useAdminAggregateReport(page: number, size: number, range: ReportDateRange) {
  return useQuery({
    queryKey: ['admin-aggregate-report', page, size, range.dateFrom, range.dateTo],
    queryFn: () => getAdminAggregateReport(page, size, range),
    placeholderData: keepPreviousData,
  });
}
