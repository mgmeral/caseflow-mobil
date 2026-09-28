import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../shared/theme/fonts';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';

interface Props {
  count: number;
  onAssign?: () => void;
  onChangeStatus?: () => void;
  onAddTag?: () => void;
  onClear: () => void;
}

// caseflow-fe TicketTable's floating bulk bar. FE also shows an "Export" button
// that has no handler; it is left out here.
export function BulkActionBar({ count, onAssign, onChangeStatus, onAddTag, onClear }: Props) {
  const actions = [
    onAssign ? { label: 'Assign', onPress: onAssign } : null,
    onChangeStatus ? { label: 'Change Status', onPress: onChangeStatus } : null,
    onAddTag ? { label: 'Add Tags', onPress: onAddTag } : null,
  ].filter((action): action is { label: string; onPress: () => void } => action != null);

  return (
    <LinearGradient colors={['rgba(255,255,255,0.97)', 'rgba(237,244,255,0.95)']} style={styles.bar}>
      <Text style={styles.count}>{count} tickets selected</Text>
      <View style={styles.divider} />
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable key={action.label} onPress={action.onPress} hitSlop={4} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={onClear} hitSlop={4} style={styles.action}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B7CDFC',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.elevated,
  },
  count: {
    ...fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#BAE6FD',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPressed: {
    backgroundColor: '#F0F9FF',
  },
  actionText: {
    ...fonts.semibold,
    fontSize: 13,
    color: '#0369A1',
  },
  clear: {
    ...fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
});
