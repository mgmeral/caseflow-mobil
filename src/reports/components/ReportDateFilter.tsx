import { ChipGroup } from '../../shared/components/ChipGroup';
import { buildReportDateRange, REPORT_DATE_PRESETS, type ReportDateRange } from '../utils/dateRange';

interface Props {
  value: ReportDateRange;
  onChange: (range: ReportDateRange) => void;
}

// Presets only; caseflow-fe additionally offers a custom from/to range.
export function ReportDateFilter({ value, onChange }: Props) {
  return (
    <ChipGroup
      options={REPORT_DATE_PRESETS}
      selected={[value.preset]}
      onToggle={(preset) => onChange(buildReportDateRange(preset))}
    />
  );
}
