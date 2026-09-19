import { AlertTriangle, MailOpen, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useInboxQueue } from '../hooks/useInboxQueue';
import { InboxQueueItem } from '../components/InboxQueueItem';
import { useSessionStore } from '../../core/auth/sessionStore';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { MetricCard } from '../../shared/components/MetricCard';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { hasPermission } from '../../shared/utils/permissions';

export function InboxScreen() {
  const { listQuery, statsQuery } = useInboxQueue();
  const items = useMemo(() => listQuery.data?.pages.flatMap((page) => page.items) ?? [], [listQuery.data?.pages]);
  const user = useSessionStore((state) => state.user);
  const canClaim = hasPermission(user?.permissionCodes ?? [], 'TICKET_ASSIGN');

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
        renderItem={({ item }) => <InboxQueueItem item={item} currentUserId={user?.id} canClaim={canClaim} />}
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
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
