import { AlertTriangle, ChevronRight, MailOpen, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useInboxQueue } from '../hooks/useInboxQueue';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { MetricCard } from '../../shared/components/MetricCard';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function InboxScreen() {
  const { listQuery, statsQuery } = useInboxQueue();
  const items = useMemo(() => listQuery.data?.pages.flatMap((page) => page.items) ?? [], [listQuery.data?.pages]);

  if (listQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.metrics}>
          <MetricCard label="All Unassigned" value={statsQuery.data?.allUnassigned ?? 0} icon={MailOpen} />
          <MetricCard label="High/Critical" value={statsQuery.data?.highOrCritical ?? 0} icon={AlertTriangle} tone="warning" />
        </View>
        <ListSkeleton rows={4} />
      </Screen>
    );
  }

  if (listQuery.isError) {
    return <CenteredState title="Could not load inbox" actionLabel="Retry" onAction={() => listQuery.refetch()} />;
  }

  return (
    <Screen>
      <View style={styles.metrics}>
        <MetricCard label="All Unassigned" value={statsQuery.data?.allUnassigned ?? 0} icon={MailOpen} />
        <MetricCard
          label="High/Critical"
          value={statsQuery.data?.highOrCritical ?? 0}
          icon={AlertTriangle}
          tone={(statsQuery.data?.highOrCritical ?? 0) > 0 ? 'error' : 'default'}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={listQuery.isRefetching && !listQuery.isFetchingNextPage}
            onRefresh={() => listQuery.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={() => {
          if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
            listQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={<EmptyState icon={Users} title="Queue is empty" description="Unassigned tickets will appear here." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.title} numberOfLines={1}>
                {item.ticketNo}
              </Text>
              <Text style={styles.subject} numberOfLines={2}>
                {item.subject}
              </Text>
              <Text style={styles.meta}>{item.customerName}</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedLight} />
          </View>
        )}
        ListFooterComponent={listQuery.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footerSpinner} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  subject: {
    ...typography.body,
  },
  meta: {
    ...typography.caption,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
