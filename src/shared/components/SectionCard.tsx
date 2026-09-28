import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props extends PropsWithChildren {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Rendered on the right of the header, like caseflow-fe's section-header actions. */
  action?: ReactNode;
}

// caseflow-fe's `.section-shell` + `.section-header`: a frosted card whose header
// carries a tinted accent strip on the left.
export function SectionCard({ title, subtitle, icon: Icon, action, children }: Props) {
  return (
    <LinearGradient colors={gradients.card} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.accentStrip} />
        {Icon ? (
          <View style={styles.iconWrap}>
            <Icon size={16} color={colors.primaryDark} strokeWidth={2} />
          </View>
        ) : null}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(133, 153, 182, 0.14)',
    backgroundColor: 'rgba(248, 251, 255, 0.72)',
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: 'rgba(31, 111, 255, 0.08)',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
  },
});
