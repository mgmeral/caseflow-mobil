jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

import type { AdminCustomerReportRow, CustomerTicketReportResponse } from '../../types/api';
import { buildReportDateRange } from './dateRange';
import { buildAdminReportHtml, buildCustomerReportHtml, escapeHtml, sumReportRows } from './reportPdf';

const range = buildReportDateRange('last30', new Date(2026, 8, 28));

function row(overrides: Partial<AdminCustomerReportRow>): AdminCustomerReportRow {
  return {
    customerId: 1,
    customerName: 'Acme',
    customerColorHex: null,
    totalCount: 0,
    openCount: 0,
    newCount: 0,
    inProgressCount: 0,
    waitingCustomerCount: 0,
    resolvedCount: 0,
    closedCount: 0,
    reopenedCount: 0,
    ...overrides,
  };
}

describe('reportPdf', () => {
  it('escapes customer-controlled text', () => {
    expect(escapeHtml(`<b>"A&B's"</b>`)).toBe('&lt;b&gt;&quot;A&amp;B&#39;s&quot;&lt;/b&gt;');
  });

  it('sums every status bucket across rows', () => {
    const totals = sumReportRows([row({ totalCount: 3, openCount: 2 }), row({ customerId: 2, totalCount: 4, resolvedCount: 1 })]);
    expect(totals.totalCount).toBe(7);
    expect(totals.openCount).toBe(2);
    expect(totals.resolvedCount).toBe(1);
  });

  it('renders one row per customer plus a total, with names escaped', () => {
    const html = buildAdminReportHtml([row({ customerName: '<script>x</script>', totalCount: 5 }), row({ customerId: 2, customerName: 'Globex', totalCount: 2 })], range);
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).toContain('<td>Globex</td>');
    expect(html).toMatch(/<tfoot><tr><td>Total<\/td><td>7<\/td>/);
    expect(html).toContain('Last 30 days');
  });

  it('renders the customer report with its tag breakdown', () => {
    const report: CustomerTicketReportResponse = {
      ...row({ totalCount: 4 }),
      from: null,
      to: null,
      byTag: [{ tagId: 1, tagCode: 'VIP', tagName: 'VIP', tagColor: '#f00', count: 2 }],
    };
    const html = buildCustomerReportHtml(report, range);
    expect(html).toContain('Acme — Ticket Report');
    expect(html).toContain('<td>VIP</td><td>2</td>');
  });
});
