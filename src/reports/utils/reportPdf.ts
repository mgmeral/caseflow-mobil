import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { AdminCustomerReportRow, CustomerTicketReportResponse, ReportStatusCounts } from '../../types/api';
import { formatReportDateRangeLabel, type ReportDateRange } from './dateRange';

// PDF export is client-side on both clients; there is no backend file endpoint.
// caseflow-fe renders its report DOM with html-to-image + jspdf, mobile renders
// an HTML document with expo-print.

const STATUS_COLUMNS: { key: keyof ReportStatusCounts; label: string }[] = [
  { key: 'totalCount', label: 'Total' },
  { key: 'newCount', label: 'New' },
  { key: 'inProgressCount', label: 'In Progress' },
  { key: 'openCount', label: 'Open' },
  { key: 'resolvedCount', label: 'Resolved' },
  { key: 'closedCount', label: 'Closed' },
  { key: 'reopenedCount', label: 'Reopened' },
  { key: 'waitingCustomerCount', label: 'Waiting' },
];

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sumReportRows(rows: ReportStatusCounts[]): ReportStatusCounts {
  return rows.reduce<ReportStatusCounts>(
    (totals, row) => {
      for (const { key } of STATUS_COLUMNS) totals[key] += row[key];
      return totals;
    },
    { totalCount: 0, newCount: 0, inProgressCount: 0, openCount: 0, resolvedCount: 0, closedCount: 0, reopenedCount: 0, waitingCustomerCount: 0 },
  );
}

function renderDocument(title: string, subtitle: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .subtitle { color: #475569; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  th { color: #475569; font-weight: 600; background: #f8fafc; }
  tfoot td { font-weight: 700; }
  h2 { font-size: 14px; margin: 0 0 8px; }
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<div class="subtitle">${escapeHtml(subtitle)}</div>
${body}
</body></html>`;
}

function generatedLine(range: ReportDateRange) {
  return `${formatReportDateRangeLabel(range)} · generated ${new Date().toLocaleString()}`;
}

export function buildAdminReportHtml(rows: AdminCustomerReportRow[], range: ReportDateRange) {
  const totals = sumReportRows(rows);
  const header = `<tr><th>Customer</th>${STATUS_COLUMNS.map((column) => `<th>${column.label}</th>`).join('')}</tr>`;
  const bodyRows = rows
    .map((row) => `<tr><td>${escapeHtml(row.customerName)}</td>${STATUS_COLUMNS.map((column) => `<td>${row[column.key]}</td>`).join('')}</tr>`)
    .join('');
  const footer = `<tr><td>Total</td>${STATUS_COLUMNS.map((column) => `<td>${totals[column.key]}</td>`).join('')}</tr>`;
  return renderDocument(
    'Customer Aggregate Report',
    generatedLine(range),
    `<table><thead>${header}</thead><tbody>${bodyRows}</tbody><tfoot>${footer}</tfoot></table>`,
  );
}

export function buildCustomerReportHtml(report: CustomerTicketReportResponse, range: ReportDateRange) {
  const statusTable = `<table><thead><tr><th>Status</th><th>Tickets</th></tr></thead><tbody>${STATUS_COLUMNS.map(
    (column) => `<tr><td>${column.label}</td><td>${report[column.key]}</td></tr>`,
  ).join('')}</tbody></table>`;
  const tagTable = report.byTag.length === 0
    ? '<div class="subtitle">No tag breakdown for this range.</div>'
    : `<table><thead><tr><th>Tag</th><th>Tickets</th></tr></thead><tbody>${report.byTag
      .map((tag) => `<tr><td>${escapeHtml(tag.tagName)}</td><td>${tag.count}</td></tr>`)
      .join('')}</tbody></table>`;
  return renderDocument(
    `${report.customerName} — Ticket Report`,
    generatedLine(range),
    `<h2>By status</h2>${statusTable}<h2>By tag</h2>${tagTable}`,
  );
}

/** Renders the HTML to a PDF and hands it to the OS share sheet (print dialog on web). */
export async function exportReportPdf(html: string) {
  if (Platform.OS === 'web') {
    // expo-print's web printToFileAsync prints the whole app window, so print the report on its own.
    const popup = window.open('', '_blank');
    if (!popup) throw new Error('Allow pop-ups to export the report.');
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
