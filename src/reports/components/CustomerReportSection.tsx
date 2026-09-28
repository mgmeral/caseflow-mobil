import { BarChart2, Download } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getDisplayMessage } from '../../core/api/http';
import { Button } from '../../shared/components/Button';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { useCustomerReport } from '../hooks/useReports';
import { buildReportDateRange, DEFAULT_REPORT_DATE_PRESET } from '../utils/dateRange';
import { buildCustomerReportHtml, exportReportPdf } from '../utils/reportPdf';
import { ReportDateFilter } from './ReportDateFilter';
import { ReportStat } from './ReportStat';

interface Props {
  customerId: string;
  canExport: boolean;
}

export function CustomerReportSection({ customerId, canExport }: Props) {
  const [range, setRange] = useState(() => buildReportDateRange(DEFAULT_REPORT_DATE_PRESET));
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const reportQuery = useCustomerReport(customerId, range);
  const report = reportQuery.data;
  const isLoading = reportQuery.isLoading;

  const handleExport = async () => {
    if (!report) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await exportReportPdf(buildCustomerReportHtml(report, range));
    } catch (error) {
      setExportError(getDisplayMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SectionCard title="Report" icon={BarChart2}>
      <View style={styles.content}>
        <ReportDateFilter value={range} onChange={setRange} />

        {reportQuery.isError ? (
          <Text style={styles.error}>{getDisplayMessage(reportQuery.error)}</Text>
        ) : (
          <>
            <View style={styles.statGrid}>
              <ReportStat label="Total" value={report?.totalCount ?? 0} isLoading={isLoading} />
              <ReportStat label="Open" value={report?.openCount ?? 0} isLoading={isLoading} />
              <ReportStat label="Resolved" value={report?.resolvedCount ?? 0} isLoading={isLoading} />
              <ReportStat label="Waiting" value={report?.waitingCustomerCount ?? 0} isLoading={isLoading} />
            </View>
            {report ? (
              <Text style={styles.caption}>
                Closed {report.closedCount} · New {report.newCount} · In progress {report.inProgressCount} · Reopened {report.reopenedCount}
              </Text>
            ) : null}

            <Text style={styles.label}>By tag</Text>
            {isLoading ? null : !report || report.byTag.length === 0 ? (
              <Text style={styles.caption}>No tagged tickets in this range.</Text>
            ) : (
              report.byTag.map((tag) => (
                <View key={`${tag.tagId}:${tag.tagCode}`} style={styles.tagRow}>
                  <View style={[styles.tagDot, { backgroundColor: tag.tagColor ?? colors.mutedLight }]} />
                  <Text style={styles.tagName} numberOfLines={1}>{tag.tagName}</Text>
                  <Text style={styles.tagCount}>{tag.count}</Text>
                </View>
              ))
            )}
          </>
        )}

        {canExport ? (
          <Button
            label="Export PDF"
            variant="secondary"
            size="sm"
            icon={<Download size={14} color={colors.text} />}
            onPress={handleExport}
            loading={isExporting}
            disabled={!report || reportQuery.isError}
            style={styles.exportButton}
          />
        ) : null}
        {exportError ? <Text style={styles.error}>{exportError}</Text> : null}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  caption: {
    ...typography.caption,
  },
  label: {
    ...typography.label,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tagName: {
    ...typography.body,
    flex: 1,
  },
  tagCount: {
    ...typography.bodyStrong,
  },
  error: {
    ...typography.caption,
    color: colors.errorText,
  },
  exportButton: {
    alignSelf: 'flex-start',
  },
});
