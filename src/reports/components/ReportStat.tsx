import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

interface Props {
  label: string;
  value: number;
  isLoading?: boolean;
}

export function ReportStat({ label, value, isLoading }: Props) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{isLoading ? '…' : value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  value: {
    ...typography.title,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...typography.label,
    marginTop: 2,
  },
});
