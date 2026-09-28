export type ReportDatePreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'allTime';

export interface ReportDateRange {
  preset: ReportDatePreset;
  /** yyyy-MM-dd in local time, or null for an open bound. */
  dateFrom: string | null;
  dateTo: string | null;
}

// Same presets and default as caseflow-fe's src/lib/reportDateRange.ts.
export const DEFAULT_REPORT_DATE_PRESET: ReportDatePreset = 'last30';

export const REPORT_DATE_PRESETS: { value: ReportDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'allTime', label: 'All time' },
];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysBefore(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - days);
  return copy;
}

export function buildReportDateRange(preset: ReportDatePreset, referenceDate = new Date()): ReportDateRange {
  const today = toDateValue(referenceDate);
  switch (preset) {
    case 'today':
      return { preset, dateFrom: today, dateTo: today };
    case 'last7':
      return { preset, dateFrom: toDateValue(daysBefore(referenceDate, 6)), dateTo: today };
    case 'thisMonth':
      return {
        preset,
        dateFrom: toDateValue(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)),
        dateTo: today,
      };
    case 'allTime':
      return { preset, dateFrom: null, dateTo: null };
    case 'last30':
    default:
      return { preset: 'last30', dateFrom: toDateValue(daysBefore(referenceDate, 29)), dateTo: today };
  }
}

export function formatReportDateRangeLabel(range: ReportDateRange) {
  return REPORT_DATE_PRESETS.find((preset) => preset.value === range.preset)?.label ?? 'Custom range';
}

/** Query string for the report endpoints; the day bounds match caseflow-fe's report.service.ts. */
export function buildReportQuery(range: ReportDateRange, extra: Record<string, string> = {}) {
  const params = Object.entries(extra).map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  if (range.dateFrom) params.push(`from=${encodeURIComponent(`${range.dateFrom}T00:00:00.000Z`)}`);
  if (range.dateTo) params.push(`to=${encodeURIComponent(`${range.dateTo}T23:59:59.999Z`)}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}
