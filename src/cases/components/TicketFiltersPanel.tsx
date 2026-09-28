import { ChevronDown, ChevronUp, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { REPORT_DATE_PRESETS, type ReportDatePreset } from '../../reports/utils/dateRange';
import { SelectSheet, type SelectSheetOption } from '../../shared/components/SelectSheet';
import { colors } from '../../shared/theme/colors';
import { fonts } from '../../shared/theme/fonts';
import { inputSurface } from '../../shared/theme/inputs';
import { spacing } from '../../shared/theme/spacing';
import type { ActiveFilterTag, TicketListFilters } from '../utils/ticketListFilters';

type SheetKey = 'status' | 'priority' | 'assignee' | 'group' | 'tag' | 'sort';

export interface FilterOptionSets {
  status: SelectSheetOption[];
  priority: SelectSheetOption[];
  assignee: SelectSheetOption[] | null; // null: the user may not list users (USER_READ)
  group: SelectSheetOption[];
  tag: SelectSheetOption[];
  sort: SelectSheetOption[];
}

interface Props {
  filters: TicketListFilters;
  onChange: (partial: Partial<TicketListFilters>) => void;
  onClearAll: () => void;
  options: FilterOptionSets;
  labels: { status: string | null; priority: string | null; assignee: string | null; group: string | null; tag: string | null; sort: string };
  sortValue: string;
  onSortChange: (value: string) => void;
  activeTags: ActiveFilterTag[];
  datePreset: ReportDatePreset | null;
  onDatePresetChange: (preset: ReportDatePreset | null) => void;
}

// Mobile form of caseflow-fe's TicketFilters: the same filters, as pills that
// open a picker instead of inline <select>s.
export function TicketFiltersPanel({
  filters, onChange, onClearAll, options, labels, sortValue, onSortChange, activeTags, datePreset, onDatePresetChange,
}: Props) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showMore, setShowMore] = useState(false);
  const [sheet, setSheet] = useState<SheetKey | null>(null);

  // FE debounces search by 300 ms.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) onChange({ search: searchInput });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const pills: { key: SheetKey; placeholder: string; value: string | null }[] = [
    { key: 'status', placeholder: 'All Statuses', value: labels.status },
    { key: 'priority', placeholder: 'All Priorities', value: labels.priority },
    ...(options.assignee ? [{ key: 'assignee' as const, placeholder: 'All Assignees', value: labels.assignee }] : []),
    { key: 'group', placeholder: 'All Groups', value: labels.group },
    { key: 'tag', placeholder: 'All Tags', value: labels.tag },
  ];

  const sheetConfig: Record<SheetKey, { title: string; options: SelectSheetOption[]; selected: string | null; search?: string }> = {
    status: { title: 'Status', options: options.status, selected: filters.status },
    priority: { title: 'Priority', options: options.priority, selected: filters.priority },
    assignee: { title: 'Assignee', options: options.assignee ?? [], selected: filters.assignedUserId != null ? String(filters.assignedUserId) : null, search: 'Search agents...' },
    group: { title: 'Group', options: options.group, selected: filters.groupId != null ? String(filters.groupId) : null },
    tag: { title: 'Tag', options: options.tag, selected: filters.tagId != null ? String(filters.tagId) : null, search: 'Search tags...' },
    sort: { title: 'Sort by', options: options.sort, selected: sortValue },
  };

  const applySheet = (key: SheetKey, value: string) => {
    const cleared = value === '';
    switch (key) {
      case 'status': return onChange({ status: cleared ? null : value });
      case 'priority': return onChange({ priority: cleared ? null : value });
      case 'assignee': return onChange({ assignedUserId: cleared ? null : Number(value) });
      case 'group': return onChange({ groupId: cleared ? null : Number(value) });
      case 'tag': return onChange({ tagId: cleared ? null : Number(value) });
      case 'sort': return onSortChange(value);
    }
  };

  const toggles: { key: 'unassignedOnly' | 'overdueOnly' | 'openOnly'; label: string }[] = [
    { key: 'unassignedOnly', label: 'Unassigned Only' },
    { key: 'overdueOnly', label: 'Overdue Only' },
    { key: 'openOnly', label: 'Open Only' },
  ];

  const current = sheet ? sheetConfig[sheet] : null;

  return (
    <View style={styles.toolbar}>
      <View style={styles.searchWrap}>
        <Search size={14} color={colors.mutedLight} style={styles.searchIcon} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search tickets..."
          placeholderTextColor={colors.mutedLight}
          autoCorrect={false}
          returnKeyType="search"
          style={[inputSurface, styles.searchInput]}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {pills.map((pill) => (
          <Pressable key={pill.key} onPress={() => setSheet(pill.key)} style={[styles.pill, pill.value && styles.pillActive]}>
            <Text style={[styles.pillText, pill.value && styles.pillTextActive]} numberOfLines={1}>{pill.value ?? pill.placeholder}</Text>
            <ChevronDown size={13} color={pill.value ? colors.primaryDark : colors.muted} />
          </Pressable>
        ))}
        <Pressable onPress={() => setSheet('sort')} style={styles.pill}>
          <Text style={styles.pillText}>{labels.sort}</Text>
          <ChevronDown size={13} color={colors.muted} />
        </Pressable>
        <Pressable onPress={() => setShowMore((value) => !value)} style={styles.pill}>
          <Text style={styles.pillText}>{showMore ? 'Less' : 'More'}</Text>
          {showMore ? <ChevronUp size={13} color={colors.muted} /> : <ChevronDown size={13} color={colors.muted} />}
        </Pressable>
      </ScrollView>

      {showMore ? (
        <View style={styles.more}>
          <View style={styles.chipRow}>
            {REPORT_DATE_PRESETS.filter((preset) => preset.value !== 'allTime').map((preset) => {
              const on = datePreset === preset.value;
              return (
                <Pressable key={preset.value} onPress={() => onDatePresetChange(on ? null : preset.value)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.chipRow}>
            {toggles.map(({ key, label }) => (
              <Pressable key={key} onPress={() => onChange({ [key]: !filters[key] })} style={[styles.chip, filters[key] && styles.chipOn]}>
                <Text style={[styles.chipText, filters[key] && styles.chipTextOn]}>{label}</Text>
              </Pressable>
            ))}
            {(['BREACHED', 'AT_RISK'] as const).map((state) => {
              const on = filters.slaState === state;
              return (
                <Pressable key={state} onPress={() => onChange({ slaState: on ? null : state })} style={[styles.chip, on && (state === 'BREACHED' ? styles.chipBreached : styles.chipRisk)]}>
                  <Text style={[styles.chipText, on && { color: state === 'BREACHED' ? '#B91C1C' : '#B45309' }]}>
                    {state === 'BREACHED' ? 'SLA Breached' : 'SLA At Risk'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {activeTags.length > 0 ? (
        <View style={styles.activeRow}>
          {activeTags.map((tag) => (
            <Pressable key={`${tag.key}-${tag.label}`} onPress={() => onChange(tag.clear)} style={styles.activeTag}>
              <Text style={styles.activeTagText}>{tag.label}</Text>
              <X size={11} color="#1258E3" />
            </Pressable>
          ))}
          <Pressable onPress={onClearAll} hitSlop={6}>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}

      <SelectSheet
        visible={current != null}
        title={current?.title ?? ''}
        options={current?.options ?? []}
        selectedValue={current?.selected ?? ''}
        searchPlaceholder={current?.search}
        onSelect={(value) => {
          if (sheet) applySheet(sheet, value);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // `.table-toolbar`
  toolbar: {
    gap: 10,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(250, 252, 255, 0.85)',
  },
  searchWrap: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 34,
  },
  pillRow: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 148, 176, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: 200,
  },
  pillActive: {
    borderColor: '#B7D0FF',
    backgroundColor: '#EDF4FF',
  },
  pillText: {
    ...fonts.medium,
    fontSize: 13,
    color: '#475569',
  },
  pillTextActive: {
    color: colors.primaryDark,
  },
  more: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // FE quick-toggle pill: uppercase 10px tracking 0.08em
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipOn: {
    borderColor: '#B7D0FF',
    backgroundColor: '#EDF4FF',
  },
  chipBreached: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  chipRisk: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  chipText: {
    ...fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#475569',
  },
  chipTextOn: {
    color: '#1258E3',
  },
  activeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C7DAFF',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeTagText: {
    ...fonts.medium,
    fontSize: 12,
    color: '#1258E3',
  },
  clearAll: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
