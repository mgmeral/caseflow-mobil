import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, CheckCircle, CheckCircle2, Clock, Hourglass, ShieldAlert, Ticket, UserX } from 'lucide-react-native';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useSessionStore } from '../../core/auth/sessionStore';
import { CenteredState } from '../../shared/components/CenteredState';
import { MetricCard } from '../../shared/components/MetricCard';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { Skeleton } from '../../shared/components/Skeleton';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { fonts } from '../../shared/theme/fonts';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

// Same filter keys caseflow-fe's DashboardPage passes to the ticket list.
export type DashboardFilter = 'active' | 'unassigned' | 'waiting' | 'resolved' | 'closed' | 'staleOpen24h' | 'slaBreached' | 'slaAtRisk';

// Mirrors caseflow-fe's DashboardPage: greeting, eight stat cards (each opening the
// filtered ticket list) and the "My Action Required" / "Needs Attention" queue.
export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useSessionStore((state) => state.user);
  const { data, isLoading, isError, isRefetching, refetch } = useDashboardStats();

  // Supervisors/admins orchestrate rather than own tickets, so the backend gives
  // them an operational queue instead of a literal "assigned to me" one.
  const isOperationalQueue = user?.ticketScope === 'ALL' || user?.ticketScope === 'OWN_GROUPS';
  const actionTitle = isOperationalQueue ? 'Needs Attention' : 'My Action Required';
  const actionEmpty = isOperationalQueue
    ? 'Nothing urgent — no unassigned or at-risk tickets right now.'
    : 'No tickets currently require your action.';
  const firstName = user?.fullName.split(' ')[0] ?? '';

  const openTickets = (filter: DashboardFilter) =>
    navigation.navigate('CasesStack', { screen: 'Cases', params: { dashboardFilter: filter } });
  const openTicket = (id: number) =>
    navigation.navigate('CasesStack', { screen: 'CaseDetail', params: { caseId: String(id) } });

  if (isError && !data) {
    return <CenteredState title="Could not load dashboard" actionLabel="Retry" onAction={refetch} />;
  }

  const items = data?.myActionRequiredItems ?? [];

  return (
    <Screen
      scrollable
      title={`Good day, ${firstName}!`}
      subtitle="Backend-driven operational snapshot."
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {isLoading || !data ? (
        <View style={styles.grid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} width="47%" height={64} radius={19} />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          <MetricCard label="Total" value={data.totalTickets} icon={Ticket} />
          <MetricCard label="Active" value={data.activeTickets} icon={Clock} tone="warning" onPress={() => openTickets('active')} />
          <MetricCard label="Unassigned" value={data.unassignedTickets} icon={UserX} tone="warning" onPress={() => openTickets('unassigned')} />
          <MetricCard label="Open > 24h" value={data.waitingOver24h} icon={Hourglass} tone="error" onPress={() => openTickets('staleOpen24h')} />
          <MetricCard label="Resolved" value={data.resolvedTickets} icon={CheckCircle} tone="success" onPress={() => openTickets('resolved')} />
          <MetricCard label="Closed" value={data.closedTickets} icon={CheckCircle2} tone="neutral" onPress={() => openTickets('closed')} />
          <MetricCard label="SLA Breached" value={data.breachedSlaCount} icon={ShieldAlert} tone="error" onPress={() => openTickets('slaBreached')} />
          <MetricCard label="At Risk" value={data.atRiskSlaCount} icon={AlertTriangle} tone="warning" onPress={() => openTickets('slaAtRisk')} />
        </View>
      )}

      <SectionCard
        title={actionTitle}
        action={<Text style={styles.count}>{isLoading ? '…' : data?.myActionRequired ?? items.length}</Text>}
      >
        {isLoading ? (
          <Text style={styles.muted}>Loading operational queue…</Text>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <CheckCircle2 size={24} color="#86EFAC" />
            <Text style={styles.muted}>{actionEmpty}</Text>
          </View>
        ) : (
          <>
            {items.slice(0, 5).map((item, index) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.row, index === 0 && styles.rowFirst, pressed && styles.rowPressed]}
                onPress={() => openTicket(item.id)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                  <Text style={styles.meta} numberOfLines={1}>{item.ticketNo} · {item.customerName}</Text>
                </View>
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={item.status} />
              </Pressable>
            ))}
            <Pressable onPress={() => navigation.navigate('CasesStack', { screen: 'Cases' })} style={styles.viewAll}>
              <Text style={styles.viewAllText}>View all tickets →</Text>
            </Pressable>
          </>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  count: {
    ...typography.caption,
    color: colors.mutedLight,
  },
  muted: {
    ...typography.caption,
    color: colors.mutedLight,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  rowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  subject: {
    ...fonts.medium,
    fontSize: 14,
    color: '#1E293B',
  },
  meta: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.mutedLight,
    marginTop: 2,
  },
  viewAll: {
    paddingTop: spacing.sm,
  },
  viewAllText: {
    ...fonts.medium,
    fontSize: 12,
    color: '#4F46E5',
  },
});
