import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { CenteredState } from '../../shared/components/CenteredState';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';

export function CustomersScreen() {
  const query = useCustomers();
  const customers = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);

  if (query.isLoading) {
    return <CenteredState title="Loading customers" />;
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
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.code}</Text>
            <Text style={styles.meta}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        )}
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
});
