import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
import { CenteredState } from '../../shared/components/CenteredState';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';

export function NotificationsScreen() {
  const query = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);

  if (query.isLoading) {
    return <CenteredState title="Loading notifications" />;
  }

  if (query.isError) {
    return <CenteredState title="Could not load notifications" actionLabel="Retry" onAction={() => query.refetch()} />;
  }

  return (
    <Screen>
      <Pressable style={styles.actionButton} onPress={() => markAll.mutate()}>
        <Text style={styles.actionLabel}>Mark all read</Text>
      </Pressable>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => !item.isRead && markOne.mutate(item.id)}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.badge}>{item.isRead ? 'Read' : 'Unread'}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.meta}>{item.ticketNo ?? 'General'} · {item.createdAt}</Text>
          </Pressable>
        )}
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionLabel: {
    color: colors.onPrimary,
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    color: colors.text,
    marginTop: 8,
  },
  meta: {
    color: colors.muted,
    marginTop: 8,
    fontSize: 12,
  },
});
