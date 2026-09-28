import { useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Ticket } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { changeCaseStatus, type TicketSortField } from '../api/casesApi';
import { BulkActionBar } from '../components/BulkActionBar';
import { TicketFiltersPanel } from '../components/TicketFiltersPanel';
import { TicketRow } from '../components/TicketRow';
import { useCases } from '../hooks/useCases';
import {
  activeFilterTags,
  BULK_STATUS_OPTIONS,
  dashboardPresetFilters,
  DEFAULT_TICKET_FILTERS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  toCaseFilters,
  type TicketListFilters,
} from '../utils/ticketListFilters';
import { useSessionStore } from '../../core/auth/sessionStore';
import { useGroups } from '../../groups/hooks/useGroups';
import { buildReportDateRange, type ReportDatePreset } from '../../reports/utils/dateRange';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { SelectSheet } from '../../shared/components/SelectSheet';
import { useToast } from '../../shared/components/Toast';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { getPriorityConfig, getStatusConfig } from '../../shared/theme/status';
import { hasPermission } from '../../shared/utils/permissions';
import { addTagToTicket } from '../../tags/api/tagsApi';
import { useActiveTags, useAllTags } from '../../tags/hooks/useTags';
import type { TicketSummaryResponse, UserSummaryResponse } from '../../types/api';
import { useUsers } from '../../users/hooks/useUsers';
import { assignOrReassignTicket } from '../../workflow/api/assignmentApi';
import { AssigneePickerSheet } from '../../workflow/components/AssigneePickerSheet';
import { BULK_COPY, bulkMessage, runForEach, type BulkCopy } from '../../workflow/utils/bulk';

// caseflow-fe sortable columns (ticketQueryContracts) plus creation date.
const SORT_OPTIONS: { value: string; label: string; field: TicketSortField; direction: 'asc' | 'desc' }[] = [
  { value: 'updatedAt:desc', label: 'Updated · newest', field: 'updatedAt', direction: 'desc' },
  { value: 'updatedAt:asc', label: 'Updated · oldest', field: 'updatedAt', direction: 'asc' },
  { value: 'priority:desc', label: 'Priority · highest', field: 'priority', direction: 'desc' },
  { value: 'priority:asc', label: 'Priority · lowest', field: 'priority', direction: 'asc' },
  { value: 'status:asc', label: 'Status', field: 'status', direction: 'asc' },
];

type BulkSheet = 'assign' | 'status' | 'tag' | null;

// Mirrors caseflow-fe's TicketListPage: page header, layered filters, the ticket
// rows, dashboard drill-down presets, and bulk assign / status / tag.
export function CasesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const toast = useToast();

  const user = useSessionStore((state) => state.user);
  const permissions = user?.permissionCodes ?? [];
  const canListUsers = hasPermission(permissions, 'USER_READ') || hasPermission(permissions, 'USER_MANAGE');
  const canAssign = hasPermission(permissions, 'TICKET_ASSIGN');
  const canChangeStatus = hasPermission(permissions, 'TICKET_STATUS_CHANGE');
  const canTag = hasPermission(permissions, 'TICKET_TAG');
  const canSeeAllTags = hasPermission(permissions, 'ADMIN_CONFIG');

  const [filters, setFilters] = useState<TicketListFilters>(DEFAULT_TICKET_FILTERS);
  const [datePreset, setDatePreset] = useState<ReportDatePreset | null>(null);
  const [sortValue, setSortValue] = useState(SORT_OPTIONS[0].value);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSheet, setBulkSheet] = useState<BulkSheet>(null);
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  // Dashboard stat cards open this screen with FE's dashboardFilter keys.
  const dashboardFilter: string | undefined = route.params?.dashboardFilter;
  useEffect(() => {
    const preset = dashboardPresetFilters(dashboardFilter);
    if (preset) {
      setFilters(preset);
      setDatePreset(null);
      setSelectedIds([]);
      navigation.setParams({ dashboardFilter: undefined });
    }
  }, [dashboardFilter, navigation]);

  const sort = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const query = useCases({ ...toCaseFilters(filters), sort: sort.field, direction: sort.direction });
  const tickets = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data?.pages]);

  const usersQuery = useUsers(canListUsers);
  const groupsQuery = useGroups();
  const allTagsQuery = useAllTags(canSeeAllTags);
  const activeTagsQuery = useActiveTags();
  const filterTags = (canSeeAllTags ? allTagsQuery.data : activeTagsQuery.data) ?? [];
  const users: UserSummaryResponse[] = usersQuery.data ?? [];
  const groups = groupsQuery.data ?? [];

  const changeFilters = useCallback((partial: Partial<TicketListFilters>) => {
    setFilters((current) => ({ ...current, ...partial }));
    setSelectedIds([]);
    if ('dateFrom' in partial && partial.dateFrom == null) setDatePreset(null);
  }, []);

  const clearAll = () => {
    setFilters(DEFAULT_TICKET_FILTERS);
    setDatePreset(null);
    setSelectedIds([]);
  };

  const onDatePresetChange = (preset: ReportDatePreset | null) => {
    setDatePreset(preset);
    const range = preset ? buildReportDateRange(preset) : null;
    changeFilters({ dateFrom: range?.dateFrom ?? null, dateTo: range?.dateTo ?? null });
    setDatePreset(preset);
  };

  const userName = (id: number) => (id === user?.id ? `${user.fullName} (me)` : users.find((candidate) => candidate.id === id)?.fullName);
  const groupName = (id: number) => groups.find((group) => group.id === id)?.name;
  const tagName = (id: number) => filterTags.find((tag) => tag.id === id)?.name;

  const statusOptions = TICKET_STATUSES.map((status) => ({ value: status, label: getStatusConfig(status).label }));
  const priorityOptions = TICKET_PRIORITIES.map((priority) => ({ value: priority, label: getPriorityConfig(priority).label }));
  // Without USER_READ the backend refuses GET /users; "me" still works as an assignee filter.
  const assigneeOptions = [
    ...(user ? [{ value: String(user.id), label: `${user.fullName} (me)` }] : []),
    ...users.filter((candidate) => candidate.isActive && candidate.id !== user?.id).map((candidate) => ({ value: String(candidate.id), label: candidate.fullName })),
  ];

  const tags = activeFilterTags(filters, {
    statusLabel: (status) => getStatusConfig(status).label,
    priorityLabel: (priority) => getPriorityConfig(priority).label,
    userName,
    groupName,
    tagName,
  });

  const toggleSelected = (ticket: TicketSummaryResponse) => {
    const id = String(ticket.id);
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const onRowPress = useCallback((ticket: TicketSummaryResponse) => {
    if (selectedIds.length > 0) {
      toggleSelected(ticket);
    } else {
      navigation.navigate('CaseDetail', { caseId: String(ticket.id) });
    }
  }, [selectedIds.length, navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishBulk = async (run: () => Promise<{ successCount: number; failCount: number }>, copy: BulkCopy) => {
    setIsBulkRunning(true);
    const result = await run();
    setIsBulkRunning(false);
    setBulkSheet(null);
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    const message = bulkMessage(result, copy);
    if (message.ok) toast.success(message.text);
    else toast.error(message.text);
  };

  const selectionLabel = `${selectedIds.length} Ticket${selectedIds.length !== 1 ? 's' : ''}`;

  const header = (
    <TicketFiltersPanel
      filters={filters}
      onChange={changeFilters}
      onClearAll={clearAll}
      options={{
        status: [{ value: '', label: 'All Statuses' }, ...statusOptions],
        priority: [{ value: '', label: 'All Priorities' }, ...priorityOptions],
        assignee: [{ value: '', label: 'All Assignees' }, ...assigneeOptions],
        group: [{ value: '', label: 'All Groups' }, ...groups.map((group) => ({ value: String(group.id), label: group.name }))],
        tag: [{ value: '', label: 'All Tags' }, ...filterTags.map((tag) => ({ value: String(tag.id), label: `${tag.name} (${tag.code})` }))],
        sort: SORT_OPTIONS.map(({ value, label }) => ({ value, label })),
      }}
      labels={{
        status: filters.status ? getStatusConfig(filters.status).label : null,
        priority: filters.priority ? getPriorityConfig(filters.priority).label : null,
        assignee: filters.assignedUserId != null ? userName(filters.assignedUserId) ?? `#${filters.assignedUserId}` : null,
        group: filters.groupId != null ? groupName(filters.groupId) ?? `#${filters.groupId}` : null,
        tag: filters.tagId != null ? tagName(filters.tagId) ?? `#${filters.tagId}` : null,
        sort: sort.label,
      }}
      sortValue={sortValue}
      onSortChange={setSortValue}
      activeTags={tags}
      datePreset={datePreset}
      onDatePresetChange={onDatePresetChange}
    />
  );

  if (query.isError && tickets.length === 0) {
    return <CenteredState title="Could not load tickets" actionLabel="Retry" onAction={() => query.refetch()} />;
  }

  return (
    <Screen title="Tickets" subtitle="Operational queue with layered filters, ownership context, and recent activity visibility.">
      <View style={styles.fill}>
        <FlatList
          data={query.isLoading ? [] : tickets}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={header}
          ListHeaderComponentStyle={styles.header}
          contentContainerStyle={[styles.listContent, selectedIds.length > 0 && styles.listWithBar]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          ListEmptyComponent={
            query.isLoading ? (
              <ListSkeleton rows={5} />
            ) : (
              <EmptyState
                icon={Ticket}
                title="No tickets found"
                description={tags.length > 0 || filters.search ? 'Try adjusting or clearing the filters.' : 'New tickets will show up here.'}
                actionLabel={tags.length > 0 || filters.search ? 'Clear filters' : undefined}
                onAction={tags.length > 0 || filters.search ? clearAll : undefined}
              />
            )
          }
          renderItem={({ item, index }) => (
            <TicketRow
              ticket={item}
              index={index}
              selected={selectedIds.includes(String(item.id))}
              selectionMode={selectedIds.length > 0}
              onPress={onRowPress}
              onLongPress={toggleSelected}
            />
          )}
          ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footerSpinner} /> : null}
        />

        {selectedIds.length > 0 ? (
          <BulkActionBar
            count={selectedIds.length}
            onAssign={canAssign && canListUsers ? () => setBulkSheet('assign') : undefined}
            onChangeStatus={canChangeStatus ? () => setBulkSheet('status') : undefined}
            onAddTag={canTag ? () => setBulkSheet('tag') : undefined}
            onClear={() => setSelectedIds([])}
          />
        ) : null}
      </View>

      <AssigneePickerSheet
        visible={bulkSheet === 'assign'}
        ticketLabel={selectionLabel}
        users={users}
        groups={groups}
        isAssigning={isBulkRunning}
        onAssign={(assignee) =>
          finishBulk(() => runForEach(selectedIds, (id) => assignOrReassignTicket(id, assignee.id)), BULK_COPY.assign)
        }
        onClose={() => setBulkSheet(null)}
      />

      <SelectSheet
        visible={bulkSheet === 'status'}
        title={`Change Status — ${selectionLabel}`}
        options={BULK_STATUS_OPTIONS.map((status) => ({
          value: status,
          label: getStatusConfig(status).label,
          description: "Tickets that don't allow this transition are skipped and reported.",
        }))}
        onSelect={(status) =>
          finishBulk(() => runForEach(selectedIds, (id) => changeCaseStatus(id, status)), BULK_COPY.status(getStatusConfig(status).label))
        }
        onClose={() => setBulkSheet(null)}
      />

      <SelectSheet
        visible={bulkSheet === 'tag'}
        title={`Add Tag — ${selectionLabel}`}
        options={(activeTagsQuery.data ?? []).map((tag) => ({ value: String(tag.id), label: tag.name }))}
        searchPlaceholder="Search tags..."
        emptyLabel="No active tags."
        onSelect={(tagId) =>
          finishBulk(() => runForEach(selectedIds, (id) => addTagToTicket(id, Number(tagId))), BULK_COPY.tag)
        }
        onClose={() => setBulkSheet(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listWithBar: {
    paddingBottom: 150,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
