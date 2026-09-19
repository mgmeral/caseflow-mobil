import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

interface Props {
  label: string;
  value: number;
  icon?: LucideIcon;
  tone?: 'default' | 'warning' | 'error';
}

const TONE_ICON_BG: Record<NonNullable<Props['tone']>, string> = {
  default: colors.primaryMuted,
  warning: colors.warningMuted,
  error: colors.errorMuted,
};

const TONE_ICON_COLOR: Record<NonNullable<Props['tone']>, string> = {
  default: colors.primary,
  warning: colors.warningText,
  error: colors.errorText,
};

export function MetricCard({ label, value, icon: Icon, tone = 'default' }: Props) {
  return (
    <View style={styles.card}>
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: TONE_ICON_BG[tone] }]}>
          <Icon size={16} color={TONE_ICON_COLOR[tone]} strokeWidth={2} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
});
