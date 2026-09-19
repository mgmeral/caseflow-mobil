import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, Briefcase, ChevronRight, Clock, Inbox } from 'lucide-react-native';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { MetricCard } from '../../shared/components/MetricCard';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { Skeleton } from '../../shared/components/Skeleton';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, isRefetching, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <Screen scrollable>
        <Skeleton width={180} height={28} />
        <Skeleton width={220} height={16} style={{ marginTop: spacing.sm }} />
        <View style={styles.metricsGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} width="47%" height={92} radius={radii.lg} />
          ))}
        </View>
        <Skeleton height={180} radius={radii.lg} />
      </Screen>
    );
  }

  if (isError || !data) {
    return <CenteredState title="Could not load dashboard" actionLabel="Retry" onAction={refetch} />;
  }

  return (
    <Screen
      scrollable
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Text style={styles.title}>CaseFlow Mobile</Text>
      <Text style={styles.subtitle}>What needs attention right now?</Text>

      <View style={styles.metricsGrid}>
        <MetricCard label="My Work" value={data.myActionRequired ?? 0} icon={Briefcase} />
        <MetricCard label="SLA Risk" value={data.atRiskSlaCount} icon={AlertTriangle} tone="warning" />
        <MetricCard label="Unassigned" value={data.unassignedTickets} icon={Inbox} />
        <MetricCard label="Waiting >24h" value={data.waitingOver24h} icon={Clock} tone={data.waitingOver24h > 0 ? 'error' : 'default'} />
      </View>

      <SectionCard title="Recent Cases" subtitle="Cases assigned to you that still require action.">
        {data.myActionRequiredItems.length === 0 ? (
          <EmptyState icon={Briefcase} title="You're all caught up" description="No cases currently require your action." />
        ) : (
          data.myActionRequiredItems.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.caseRow, index === 0 && styles.caseRowFirst]}
              onPress={() => navigation.navigate('CasesStack', { screen: 'CaseDetail', params: { caseId: String(item.id) } })}
            >
              <View style={styles.caseRowText}>
                <Text style={styles.caseTitle} numberOfLines={1}>
                  {item.ticketNo} · {item.subject}
                </Text>
                <Text style={styles.caseMeta} numberOfLines={1}>
                  {item.customerName}
                </Text>
                <View style={styles.badgeRow}>
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </View>
              </View>
              <ChevronRight size={18} color={colors.mutedLight} />
            </Pressable>
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.display,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.subtitle,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  caseRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  caseRowText: {
    flex: 1,
    gap: spacing.xxs,
  },
  caseTitle: {
    ...typography.bodyStrong,
  },
  caseMeta: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
