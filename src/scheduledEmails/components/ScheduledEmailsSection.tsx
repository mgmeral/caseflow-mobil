import { CalendarClock, MailX } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { getDisplayMessage } from '../../core/api/http';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { ScheduledEmailResponse } from '../../types/api';
import { useCancelScheduledEmail, useScheduledEmails } from '../hooks/useScheduledEmails';
import { formatDateTime, isCancelable, scheduledStatusVariant, splitScheduledEmails } from '../utils/scheduledEmails';

interface Props {
  ticketPublicId: string | null;
}

export function ScheduledEmailsSection({ ticketPublicId }: Props) {
  const scheduledQuery = useScheduledEmails(ticketPublicId, true);
  const cancelMutation = useCancelScheduledEmail(ticketPublicId);

  if (!ticketPublicId) {
    return (
      <SectionCard title="Scheduled Emails" icon={CalendarClock}>
        <Text style={styles.muted}>Unavailable: this ticket has no public identifier.</Text>
      </SectionCard>
    );
  }

  const items = scheduledQuery.data ?? [];
  const { pending, history } = splitScheduledEmails(items);

  const renderItem = (item: ScheduledEmailResponse) => (
    <View key={item.id} style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.subject} numberOfLines={2}>{item.subject}</Text>
        <Badge label={item.status} variant={scheduledStatusVariant(item.status)} />
      </View>
      <Text style={styles.meta} numberOfLines={1}>To {item.resolvedToAddress ?? '—'}</Text>
      <Text style={styles.meta}>Send not before {formatDateTime(item.sendNotBefore)}</Text>
      {item.sentAt ? <Text style={styles.meta}>Sent {formatDateTime(item.sentAt)}</Text> : null}
      {item.canceledAt ? <Text style={styles.meta}>Canceled {formatDateTime(item.canceledAt)}</Text> : null}
      {item.failureReason || item.failureCategory ? (
        <Text style={styles.failure}>{item.failureCategory ? `${item.failureCategory}: ` : ''}{item.failureReason ?? 'Delivery failed'}</Text>
      ) : null}
      {isCancelable(item) ? (
        <Button
          label="Cancel schedule"
          variant="secondary"
          size="sm"
          icon={<MailX size={14} color={colors.text} />}
          onPress={() => cancelMutation.mutate(item.id)}
          loading={cancelMutation.isPending && cancelMutation.variables === item.id}
          style={styles.cancelButton}
        />
      ) : null}
    </View>
  );

  return (
    <SectionCard title="Scheduled Emails" subtitle="Replies queued to go out later. Schedule one from Reply." icon={CalendarClock}>
      {scheduledQuery.isLoading ? (
        <Text style={styles.muted}>Loading scheduled emails…</Text>
      ) : scheduledQuery.isError ? (
        <Text style={styles.failure}>{getDisplayMessage(scheduledQuery.error)}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.muted}>No scheduled emails yet.</Text>
      ) : (
        <View style={styles.groups}>
          {pending.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Upcoming</Text>
              {pending.map(renderItem)}
            </View>
          ) : null}
          {history.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>History</Text>
              {history.map(renderItem)}
            </View>
          ) : null}
        </View>
      )}
      {cancelMutation.isError ? <Text style={styles.failure}>{getDisplayMessage(cancelMutation.error)}</Text> : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  muted: {
    ...typography.body,
    color: colors.muted,
  },
  groups: {
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    ...typography.label,
  },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  subject: {
    ...typography.bodyStrong,
    flex: 1,
  },
  meta: {
    ...typography.caption,
  },
  failure: {
    ...typography.caption,
    color: colors.errorText,
    marginTop: spacing.xs,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
});
