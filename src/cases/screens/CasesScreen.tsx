import { useNavigation } from '@react-navigation/native';
import { Briefcase, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useCases } from '../hooks/useCases';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SlaBadge } from '../../shared/components/SlaBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function CasesScreen() {
  const navigation = useNavigation<any>();
  const query = useCases({ openOnly: true });

  const cases = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  if (query.isLoading) {
    return (
      <Screen>
        <ListSkeleton />
      </Screen>
    );
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
        refreshControl={
          <RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        ListEmptyComponent={<EmptyState icon={Briefcase} title="No open cases" description="Cases assigned to you will show up here." />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('CaseDetail', { caseId: String(item.id) })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.caseTitle} numberOfLines={1}>
                {item.ticketNo}
              </Text>
              <ChevronRight size={18} color={colors.mutedLight} />
            </View>
            <Text style={styles.subject} numberOfLines={2}>
              {item.subject}
            </Text>
            <Text style={styles.meta}>{item.customerName ?? 'Unknown customer'}</Text>
            <View style={styles.badgeRow}>
              <PriorityBadge priority={item.priority} />
              <StatusBadge status={item.status} />
              <SlaBadge slaState={item.slaState} />
            </View>
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xxs,
    ...shadows.soft,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseTitle: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  subject: {
    ...typography.body,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
