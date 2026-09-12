import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { CenteredState } from '../../shared/components/CenteredState';
import { MetricCard } from '../../shared/components/MetricCard';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return <CenteredState title="Loading dashboard" />;
  }

  if (isError || !data) {
    return <CenteredState title="Could not load dashboard" actionLabel="Retry" onAction={refetch} />;
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>CaseFlow Mobile</Text>
      <Text style={styles.subtitle}>What needs attention right now?</Text>

      <View style={styles.metricsGrid}>
        <MetricCard label="My Work" value={data.myActionRequired ?? 0} />
        <MetricCard label="SLA Risk" value={data.atRiskSlaCount} />
        <MetricCard label="Unassigned" value={data.unassignedTickets} />
        <MetricCard label="Waiting >24h" value={data.waitingOver24h} />
      </View>

      <SectionCard title="Recent Cases" subtitle="Cases assigned to you that still require action.">
        {data.myActionRequiredItems.length === 0 ? (
          <Text style={styles.emptyText}>No cases currently require your action.</Text>
        ) : (
          data.myActionRequiredItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.caseRow}
              onPress={() => navigation.navigate('CasesStack', { screen: 'CaseDetail', params: { caseId: String(item.id) } })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.caseTitle}>{item.ticketNo} · {item.subject}</Text>
                <Text style={styles.caseMeta}>{item.customerName}</Text>
              </View>
              <View>
                <Text style={styles.caseMeta}>{item.priority}</Text>
                <Text style={styles.caseMeta}>{item.status}</Text>
              </View>
            </Pressable>
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  emptyText: {
    color: colors.muted,
  },
  caseRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  caseTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  caseMeta: {
    color: colors.muted,
    fontSize: 13,
  },
});
