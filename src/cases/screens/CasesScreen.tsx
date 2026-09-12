import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCases } from '../hooks/useCases';
import { CenteredState } from '../../shared/components/CenteredState';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';

export function CasesScreen() {
  const navigation = useNavigation<any>();
  const query = useCases({ openOnly: true });

  const cases = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  if (query.isLoading) {
    return <CenteredState title="Loading cases" />;
  }

  if (query.isError) {
    return <CenteredState title="Could not load cases" actionLabel="Retry" onAction={() => query.refetch()} />;
  }

  return (
    <Screen>
      <FlatList
        data={cases}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('CaseDetail', { caseId: String(item.id) })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.caseTitle}>{item.ticketNo}</Text>
              <Text style={styles.badge}>{item.priority}</Text>
            </View>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.meta}>{item.customerName ?? 'Unknown customer'}</Text>
            <Text style={styles.meta}>Status: {item.status}</Text>
            <Text style={styles.meta}>SLA: {item.slaState ?? 'N/A'}</Text>
          </Pressable>
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
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subject: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
