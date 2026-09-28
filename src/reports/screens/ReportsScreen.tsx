import { BarChart2, Download } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getDisplayMessage } from '../../core/api/http';
import { useSessionStore } from '../../core/auth/sessionStore';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { hasPermission } from '../../shared/utils/permissions';
import { ReportDateFilter } from '../components/ReportDateFilter';
import { ReportStat } from '../components/ReportStat';
import { useAdminAggregateReport } from '../hooks/useReports';
import { buildReportDateRange, DEFAULT_REPORT_DATE_PRESET, formatReportDateRangeLabel } from '../utils/dateRange';
import { buildAdminReportHtml, exportReportPdf, sumReportRows } from '../utils/reportPdf';

const PAGE_SIZE = 20;

export function ReportsScreen() {
  const permissions = useSessionStore((state) => state.user?.permissionCodes ?? []);
  const canExport = hasPermission(permissions, 'DATA_EXPORT');

  const [range, setRange] = useState(() => buildReportDateRange(DEFAULT_REPORT_DATE_PRESET));
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const reportQuery = useAdminAggregateReport(page, PAGE_SIZE, range);
  const rows = reportQuery.data?.items ?? [];
  const totalPages = Math.max(reportQuery.data?.totalPages ?? 1, 1);
  // Like caseflow-fe, the totals cover the rows on the current page.
  const totals = sumReportRows(rows);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportReportPdf(buildAdminReportHtml(rows, range));
    } catch (error) {
      setExportError(getDisplayMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Screen
      scrollable
      refreshControl={<RefreshControl refreshing={reportQuery.isRefetching} onRefresh={() => reportQuery.refetch()} />}
    >
      <Text style={styles.intro}>Ticket volume and open load per customer · {formatReportDateRangeLabel(range)}</Text>

      <ReportDateFilter
        value={range}
        onChange={(next) => {
          setPage(0);
          setRange(next);
        }}
      />

      <View style={styles.statGrid}>
        <ReportStat label="Total" value={totals.totalCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="Open" value={totals.openCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="New" value={totals.newCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="In Progress" value={totals.inProgressCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="Waiting" value={totals.waitingCustomerCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="Resolved" value={totals.resolvedCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="Closed" value={totals.closedCount} isLoading={reportQuery.isLoading} />
        <ReportStat label="Reopened" value={totals.reopenedCount} isLoading={reportQuery.isLoading} />
      </View>

      {canExport ? (
        <Button
          label="Export PDF"
          variant="secondary"
          icon={<Download size={16} color={colors.text} />}
          onPress={handleExport}
          loading={isExporting}
          disabled={reportQuery.isLoading || rows.length === 0}
        />
      ) : null}
      {exportError ? <Text style={styles.error}>{exportError}</Text> : null}

      <SectionCard title="By customer" icon={BarChart2}>
        {reportQuery.isLoading ? (
          <ListSkeleton rows={3} />
        ) : reportQuery.isError ? (
          <Text style={styles.error}>{getDisplayMessage(reportQuery.error)}</Text>
        ) : rows.length === 0 ? (
          <EmptyState icon={BarChart2} title="No report rows" description="Nothing was returned for the selected date range." />
        ) : (
          rows.map((row, index) => (
            <View key={row.customerId} style={[styles.row, index === 0 && styles.rowFirst]}>
              <View style={styles.rowHeader}>
                <View style={[styles.colorDot, { backgroundColor: row.customerColorHex ?? colors.border }]} />
                <Text style={styles.customerName} numberOfLines={1}>{row.customerName}</Text>
                <Text style={styles.total}>{row.totalCount}</Text>
              </View>
              <Text style={styles.breakdown}>
                New {row.newCount} · In progress {row.inProgressCount} · Open {row.openCount} · Waiting {row.waitingCustomerCount}
              </Text>
              <Text style={styles.breakdown}>
                Resolved {row.resolvedCount} · Closed {row.closedCount} · Reopened {row.reopenedCount}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <View style={styles.pager}>
        <Button
          label="Previous"
          variant="secondary"
          size="sm"
          onPress={() => setPage((current) => Math.max(0, current - 1))}
          disabled={page === 0 || reportQuery.isFetching}
        />
        <Text style={styles.pageLabel}>Page {page + 1} of {totalPages}</Text>
        <Button
          label="Next"
          variant="secondary"
          size="sm"
          onPress={() => setPage((current) => current + 1)}
          disabled={page + 1 >= totalPages || reportQuery.isFetching}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.muted,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.errorText,
  },
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingVertical: spacing.md,
    gap: 2,
  },
  rowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customerName: {
    ...typography.bodyStrong,
    flex: 1,
  },
  total: {
    ...typography.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  breakdown: {
    ...typography.caption,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageLabel: {
    ...typography.caption,
  },
});
