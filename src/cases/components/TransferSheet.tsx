import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Button } from '../../shared/components/Button';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { GroupSummaryResponse } from '../../types/api';

interface Props {
  visible: boolean;
  groups: GroupSummaryResponse[];
  currentGroupId: number | null;
  currentGroupName: string | null;
  isSubmitting: boolean;
  onConfirm: (toGroupId: number, reason: string) => void;
  onClose: () => void;
}

export function TransferSheet({ visible, groups, currentGroupId, currentGroupName, isSubmitting, onConfirm, onClose }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setSelectedGroupId(null);
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (selectedGroupId == null) return;
    onConfirm(selectedGroupId, reason.trim());
    setSelectedGroupId(null);
    setReason('');
  };

  const isSameGroup = selectedGroupId != null && selectedGroupId === currentGroupId;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Transfer Ticket</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>

          {currentGroupName ? <Text style={styles.currentGroup}>Current group: {currentGroupName}</Text> : null}

          <ScrollView style={styles.list} bounces={false}>
            {groups.length === 0 ? (
              <Text style={styles.empty}>No groups available.</Text>
            ) : (
              groups.map((group) => {
                const isSelected = group.id === selectedGroupId;
                return (
                  <Pressable
                    key={group.id}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => setSelectedGroupId(group.id)}
                  >
                    <Text style={styles.optionLabel}>{group.name}</Text>
                    {isSelected ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {isSameGroup ? <Text style={styles.warning}>This is already the ticket's current group.</Text> : null}

          <View style={styles.reasonBlock}>
            <Text style={styles.reasonLabel}>Reason (optional)</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Explain why this ticket needs to be transferred…"
              placeholderTextColor={colors.mutedLight}
              style={styles.reasonInput}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" onPress={handleClose} style={styles.footerButton} />
            <Button
              label="Transfer"
              onPress={handleConfirm}
              disabled={selectedGroupId == null || isSameGroup}
              loading={isSubmitting}
              style={styles.footerButton}
            />
          </View>
        </Pressable>
      </Pressable>
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    fontSize: 17,
  },
  currentGroup: {
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.sm,
    maxHeight: 220,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionLabel: {
    ...typography.bodyStrong,
  },
  warning: {
    ...typography.caption,
    color: colors.warningText,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  reasonBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  reasonLabel: {
    ...typography.label,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
    color: colors.text,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  footerButton: {
    flex: 1,
  },
});
