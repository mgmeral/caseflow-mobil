import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useCustomers } from '../hooks/useCustomers';
import { Avatar } from '../../shared/components/Avatar';
import { Badge } from '../../shared/components/Badge';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function CustomersScreen() {
  const navigation = useNavigation<any>();
  const query = useCustomers();
  const customers = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);

  if (query.isLoading) {
    return (
      <Screen>
        <ListSkeleton />
      </Screen>
    );
  }

  if (query.isError) {
    return <CenteredState title="Could not load customers" actionLabel="Retry" onAction={() => query.refetch()} />;
  }

  return (
    <Screen>
      <FlatList
        data={customers}
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
        ListEmptyComponent={<EmptyState icon={Users} title="No customers found" />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: String(item.id) })}
          >
            <Avatar name={item.name} size={40} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>{item.code}</Text>
            </View>
            <Badge label={item.isActive ? 'Active' : 'Inactive'} variant={item.isActive ? 'success' : 'default'} />
            <ChevronRight size={18} color={colors.mutedLight} />
          </Pressable>
        )}
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footerSpinner} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  meta: {
    ...typography.caption,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
