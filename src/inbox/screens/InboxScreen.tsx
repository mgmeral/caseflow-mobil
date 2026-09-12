import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useInboxQueue } from '../hooks/useInboxQueue';
import { CenteredState } from '../../shared/components/CenteredState';
import { MetricCard } from '../../shared/components/MetricCard';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';

export function InboxScreen() {
  const { listQuery, statsQuery } = useInboxQueue();
  const items = useMemo(() => listQuery.data?.pages.flatMap((page) => page.items) ?? [], [listQuery.data?.pages]);

  if (listQuery.isLoading) {
    return <CenteredState title="Loading inbox" />;
  }

  if (listQuery.isError) {
    return <CenteredState title="Could not load inbox" actionLabel="Retry" onAction={() => listQuery.refetch()} />;
  }

  return (
    <Screen>
      <View style={styles.metrics}>
        <MetricCard label="All Unassigned" value={statsQuery.data?.allUnassigned ?? 0} />
        <MetricCard label="High/Critical" value={statsQuery.data?.highOrCritical ?? 0} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
            listQuery.fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.ticketNo}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.meta}>{item.customerName}</Text>
          </View>
        )}
        ListFooterComponent={listQuery.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subject: {
    color: colors.text,
    marginTop: 4,
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
});
