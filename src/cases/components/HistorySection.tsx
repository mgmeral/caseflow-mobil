import { History as HistoryIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { HistorySummaryResponse } from '../../types/api';

function describeEvent(entry: HistorySummaryResponse): string {
  if (entry.summary) return entry.summary;
  return entry.actionType.replace(/_/g, ' ').toLowerCase();
}

interface Props {
  history: HistorySummaryResponse[];
}

export function HistorySection({ history }: Props) {
  if (history.length === 0) {
    return null;
  }

  const sorted = [...history].sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));

  return (
    <SectionCard title="History" icon={HistoryIcon}>
      {sorted.map((entry, index) => (
        <View key={entry.id} style={[styles.row, index === 0 && styles.rowFirst]}>
          <Text style={styles.summary}>{describeEvent(entry)}</Text>
          <Text style={styles.meta}>
            {entry.performedByName ?? 'System'} · {entry.performedAt}
          </Text>
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    gap: 2,
  },
  rowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  summary: {
    ...typography.body,
    textTransform: 'capitalize',
  },
  meta: {
    ...typography.caption,
  },
});
