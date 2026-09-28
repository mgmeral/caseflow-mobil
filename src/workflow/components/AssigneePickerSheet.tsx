import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../shared/components/Avatar';
import { Button } from '../../shared/components/Button';
import { ChipGroup } from '../../shared/components/ChipGroup';
import { colors } from '../../shared/theme/colors';
import { fonts } from '../../shared/theme/fonts';
import { floatingSurface, formLabel, inputSurface } from '../../shared/theme/inputs';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { GroupSummaryResponse, UserSummaryResponse } from '../../types/api';

interface Props {
  visible: boolean;
  /** "TKT-0001", or "3 tickets" for bulk assign. */
  ticketLabel: string;
  currentAssigneeId?: number | null;
  currentAssigneeName?: string | null;
  currentGroupName?: string | null;
  users: UserSummaryResponse[];
  groups: GroupSummaryResponse[];
  isAssigning: boolean;
  onAssign: (user: UserSummaryResponse) => void;
  onClose: () => void;
}

// caseflow-fe AssignmentModal: workload colour for "n open".
function workloadColor(count: number) {
  if (count < 5) return '#16A34A';
  if (count <= 10) return '#CA8A04';
  return '#EA580C';
}

export function AssigneePickerSheet({
  visible, ticketLabel, currentAssigneeId, currentAssigneeName, currentGroupName,
  users, groups, isAssigning, onAssign, onClose,
}: Props) {
  const [groupId, setGroupId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setGroupId('');
      setSearch('');
      setSelectedId(null);
    }
  }, [visible]);

  // GET /users carries no group membership; it comes from each group's memberIds.
  const groupNamesByUser = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const group of groups) {
      for (const memberId of group.memberIds ?? []) map.set(memberId, [...(map.get(memberId) ?? []), group.name]);
    }
    return map;
  }, [groups]);

  const members = groups.find((group) => String(group.id) === groupId)?.memberIds ?? [];
  const needle = search.trim().toLowerCase();
  const filtered = users.filter((user) => {
    if (!user.isActive) return false;
    if (groupId && !members.includes(user.id)) return false;
    if (needle && !user.fullName.toLowerCase().includes(needle)) return false;
    return true;
  });

  const selected = users.find((user) => user.id === selectedId) ?? null;
  const isSameAssignee = selected != null && selected.id === currentAssigneeId;
  const verb = currentAssigneeId ? 'Reassign' : 'Assign';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{verb} {ticketLabel}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {currentAssigneeName || currentGroupName ? (
              <View style={styles.current}>
                <Text style={styles.currentText}>
                  {currentAssigneeName ? <>Currently assigned to <Text style={fonts.semibold}>{currentAssigneeName}</Text></> : 'Ticket is currently unassigned.'}
                </Text>
                {currentGroupName ? <Text style={styles.currentGroup}>Current group: {currentGroupName}</Text> : null}
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={formLabel}>Filter by Group</Text>
              <ChipGroup
                options={[{ value: '', label: 'All Groups' }, ...groups.map((group) => ({ value: String(group.id), label: group.name }))]}
                selected={[groupId]}
                onToggle={(value) => {
                  setGroupId(value);
                  setSelectedId(null);
                }}
              />
              <Text style={styles.hint}>Assignments keep the current ticket group unless you explicitly transfer the ticket.</Text>
            </View>

            <View style={styles.field}>
              <Text style={formLabel}>Select Agent</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search agents..."
                placeholderTextColor={colors.mutedLight}
                autoCorrect={false}
                style={inputSurface}
              />
              <View style={styles.list}>
                {filtered.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyText}>No agents found</Text>
                    {groupId && !needle ? <Text style={styles.hint}>No active agents in this group. Try a different group or clear the filter.</Text> : null}
                  </View>
                ) : (
                  filtered.map((user) => (
                    <Pressable
                      key={user.id}
                      onPress={() => setSelectedId(user.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: user.id === selectedId }}
                      style={[styles.user, user.id === selectedId && styles.userSelected, user.id === currentAssigneeId && styles.userCurrent]}
                    >
                      <Avatar name={user.fullName} size={30} />
                      <View style={styles.userText}>
                        <Text style={styles.userName}>{user.fullName}</Text>
                        <Text style={styles.userGroups} numberOfLines={1}>{(groupNamesByUser.get(user.id) ?? []).join(', ')}</Text>
                      </View>
                      <Text style={[styles.workload, { color: workloadColor(user.openTicketCount) }]}>{user.openTicketCount} open</Text>
                    </Pressable>
                  ))
                )}
              </View>
            </View>

            {isSameAssignee ? (
              <View style={styles.warning}>
                <Text style={styles.warningText}>
                  {selected?.fullName} is already assigned to this ticket. Select a different agent to reassign.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="sm" onPress={onClose} disabled={isAssigning} style={styles.footerButton} />
            <Button
              label={verb}
              size="sm"
              onPress={() => selected && onAssign(selected)}
              loading={isAssigning}
              disabled={!selected || isSameAssignee}
              style={styles.footerButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    ...floatingSurface,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    ...typography.title,
    fontSize: 16,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  current: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  currentText: {
    ...fonts.regular,
    fontSize: 14,
    color: '#64748B',
  },
  currentGroup: {
    ...typography.caption,
    color: colors.mutedLight,
    marginTop: 4,
  },
  field: {
    gap: 6,
  },
  hint: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.mutedLight,
  },
  list: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 4,
  },
  emptyText: {
    ...fonts.regular,
    fontSize: 14,
    color: colors.mutedLight,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  userSelected: {
    backgroundColor: '#EEF5FF',
  },
  userCurrent: {
    opacity: 0.5,
  },
  userText: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    ...fonts.medium,
    fontSize: 14,
    color: '#1E293B',
  },
  userGroups: {
    ...fonts.regular,
    fontSize: 12,
    color: colors.mutedLight,
  },
  workload: {
    ...fonts.medium,
    fontSize: 12,
  },
  warning: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  warningText: {
    ...fonts.regular,
    fontSize: 12,
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footerButton: {
    minWidth: 110,
  },
});
