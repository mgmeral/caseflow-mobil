import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { RefreshControlProps, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props extends PropsWithChildren {
  scrollable?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  /** caseflow-fe's `.page-header`: page title, subtitle and an optional action on the right. */
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export function Screen({ children, scrollable = false, refreshControl, title, subtitle, headerAction }: Props) {
  const header = title ? (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {headerAction}
    </View>
  ) : null;

  const content = scrollable ? (
    <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={refreshControl}>
      {header}
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>
      {header}
      {children}
    </View>
  );

  // The page background is the same soft blue-to-grey wash caseflow-fe paints on <html>.
  return (
    <LinearGradient colors={gradients.page} locations={[0, 0.42, 1]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>{content}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.display,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 4,
  },
});
