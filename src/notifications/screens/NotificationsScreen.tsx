import { Bell, CheckCheck } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function NotificationsScreen() {
  const query = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);

  if (query.isLoading) {
    return (
      <Screen>
        <ListSkeleton />
      </Screen>
    );
  }

  if (query.isError) {
    return <CenteredState title="Could not load notifications" actionLabel="Retry" onAction={() => query.refetch()} />;
  }

  const hasUnread = items.some((item) => !item.isRead);

  return (
    <Screen>
      {hasUnread ? (
        <Button
          label="Mark all read"
          onPress={() => markAll.mutate()}
          variant="secondary"
          icon={<CheckCheck size={16} color={colors.text} />}
          style={styles.actionButton}
        />
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        ListEmptyComponent={<EmptyState icon={Bell} title="No notifications yet" description="You'll see ticket and mention updates here." />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => !item.isRead && markOne.mutate(item.id)}>
            {!item.isRead ? <View style={styles.unreadDot} /> : null}
            <View style={styles.cardText}>
              <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.message} numberOfLines={3}>
                {item.message}
              </Text>
              <Text style={styles.meta}>
                {item.ticketNo ?? 'General'} · {item.createdAt}
              </Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footerSpinner} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  cardText: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  titleUnread: {
    color: colors.text,
    fontWeight: '700',
  },
  message: {
    ...typography.body,
    color: colors.muted,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
