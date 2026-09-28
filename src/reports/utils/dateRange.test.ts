import { buildReportDateRange, buildReportQuery, formatReportDateRangeLabel } from './dateRange';

const REFERENCE = new Date(2026, 8, 28, 15, 30); // 28 Sep 2026, local time

describe('buildReportDateRange', () => {
  it('builds inclusive local-day ranges for each preset', () => {
    expect(buildReportDateRange('today', REFERENCE)).toEqual({ preset: 'today', dateFrom: '2026-09-28', dateTo: '2026-09-28' });
    expect(buildReportDateRange('last7', REFERENCE)).toEqual({ preset: 'last7', dateFrom: '2026-09-22', dateTo: '2026-09-28' });
    expect(buildReportDateRange('last30', REFERENCE)).toEqual({ preset: 'last30', dateFrom: '2026-08-30', dateTo: '2026-09-28' });
    expect(buildReportDateRange('thisMonth', REFERENCE)).toEqual({ preset: 'thisMonth', dateFrom: '2026-09-01', dateTo: '2026-09-28' });
  });

  it('leaves both bounds open for all time', () => {
    expect(buildReportDateRange('allTime', REFERENCE)).toEqual({ preset: 'allTime', dateFrom: null, dateTo: null });
  });

  it('labels the preset', () => {
    expect(formatReportDateRangeLabel(buildReportDateRange('last7', REFERENCE))).toBe('Last 7 days');
  });
});

describe('buildReportQuery', () => {
  it('sends whole-day ISO instants like caseflow-fe', () => {
    const query = buildReportQuery(buildReportDateRange('today', REFERENCE));
    expect(query).toBe(`?from=${encodeURIComponent('2026-09-28T00:00:00.000Z')}&to=${encodeURIComponent('2026-09-28T23:59:59.999Z')}`);
  });

  it('keeps paging params and omits open bounds', () => {
    expect(buildReportQuery(buildReportDateRange('allTime', REFERENCE), { page: '1', size: '20' })).toBe('?page=1&size=20');
    expect(buildReportQuery(buildReportDateRange('allTime', REFERENCE))).toBe('');
  });
});
