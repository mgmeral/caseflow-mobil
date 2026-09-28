import { Check } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { fonts } from '../../shared/theme/fonts';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import type { TicketSummaryResponse } from '../../types/api';
import { openMinutes } from '../utils/ticketListFilters';
import { AgingIndicator } from './AgingIndicator';
import { OwnerCell } from './OwnerCell';

interface Props {
  ticket: TicketSummaryResponse;
  index: number;
  selected: boolean;
  selectionMode: boolean;
  onPress: (ticket: TicketSummaryResponse) => void;
  onLongPress: (ticket: TicketSummaryResponse) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// date-fns 'MMM d, HH:mm', as in caseflow-fe's Updated column.
export function formatUpdated(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// One caseflow-fe TicketTableRow as a card: every column is kept
// (subject, number, customer, status, priority, owner, group, aging, updated).
function TicketRowComponent({ ticket, index, selected, selectionMode, onPress, onLongPress }: Props) {
  const slaBreached = ticket.slaState === 'BREACHED';
  return (
    <Pressable
      onPress={() => onPress(ticket)}
      onLongPress={() => onLongPress(ticket)}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.card,
        // FE's striped rows: blue tint on odd rows, slate on even.
        { backgroundColor: index % 2 === 0 ? 'rgba(235, 242, 255, 0.92)' : 'rgba(244, 246, 250, 0.92)' },
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        {selectionMode ? (
          <View style={[styles.checkbox, selected && styles.checkboxOn]}>
            {selected ? <Check size={12} color={colors.onPrimary} strokeWidth={3} /> : null}
          </View>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.subject} numberOfLines={2}>{ticket.subject}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {ticket.ticketNo} · {ticket.customerName ?? '—'}
          </Text>
        </View>
      </View>

      <View style={styles.badges}>
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        {ticket.assignedGroupName ? (
          <View style={styles.groupPill}>
            <Text style={styles.groupText} numberOfLines={1}>{ticket.assignedGroupName}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <OwnerCell userName={ticket.assignedUserName} />
        <View style={styles.bottomRight}>
          <AgingIndicator
            openDurationMinutes={openMinutes(ticket.createdAt)}
            slaBreached={slaBreached}
            slaDeadlineAt={ticket.resolutionDueAt}
          />
          {ticket.updatedAt ? <Text style={styles.updated}>{formatUpdated(ticket.updatedAt)}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export const TicketRow = memo(TicketRowComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.soft,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  subject: {
    ...fonts.medium,
    fontSize: 14,
    color: '#111827',
  },
  meta: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.mutedLight,
    marginTop: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  groupPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    backgroundColor: 'rgba(241, 246, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    maxWidth: 160,
  },
  groupText: {
    ...fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#526277',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bottomRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  updated: {
    ...fonts.regular,
    fontSize: 11,
    color: colors.mutedLight,
    fontVariant: ['tabular-nums'],
  },
});
