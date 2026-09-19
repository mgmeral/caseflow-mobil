import { useRoute } from '@react-navigation/native';
import { ArrowDownLeft, ArrowUpRight, FileText, MessageSquare } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useCaseDetail } from '../hooks/useCaseDetail';
import { useConversation } from '../../conversations/hooks/useConversation';
import { Avatar } from '../../shared/components/Avatar';
import { CenteredState } from '../../shared/components/CenteredState';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { SlaBadge } from '../../shared/components/SlaBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function CaseDetailScreen() {
  const route = useRoute<any>();
  const caseId = String(route.params?.caseId ?? '');
  const detailQuery = useCaseDetail(caseId);
  const conversationQuery = useConversation(caseId);

  if (detailQuery.isLoading) {
    return <CenteredState title="Loading case detail" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <CenteredState title="Could not load case detail" actionLabel="Retry" onAction={() => detailQuery.refetch()} />;
  }

  const detail = detailQuery.data;
  const messages = conversationQuery.data ?? [];

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Avatar name={detail.customerName || detail.ticketNo} size={48} />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {detail.ticketNo}
          </Text>
          <Text style={styles.subject}>{detail.subject}</Text>
          <Text style={styles.meta}>{detail.customerName}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <PriorityBadge priority={detail.priority} size="md" />
        <StatusBadge status={detail.status} size="md" />
        <SlaBadge slaState={detail.slaState} size="md" />
      </View>

      <SectionCard title="Case Overview" icon={FileText}>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Assigned</Text>
          <Text style={styles.overviewValue}>{detail.assignedUserName ?? 'Unassigned'}</Text>
        </View>
        {detail.description ? <Text style={styles.description}>{detail.description}</Text> : null}
      </SectionCard>

      <SectionCard title="Conversation" subtitle="Current backend contract is email-backed." icon={MessageSquare}>
        {conversationQuery.isLoading ? (
          <Text style={styles.body}>Loading conversation…</Text>
        ) : messages.length === 0 ? (
          <Text style={styles.body}>No conversation items found.</Text>
        ) : (
          messages.map((message) => {
            const isInbound = message.direction === 'INBOUND';
            return (
              <View key={`${message.direction}-${message.id}`} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={[styles.directionIcon, { backgroundColor: isInbound ? colors.infoMuted : colors.successMuted }]}>
                    {isInbound ? (
                      <ArrowDownLeft size={13} color={colors.infoText} strokeWidth={2.25} />
                    ) : (
                      <ArrowUpRight size={13} color={colors.successText} strokeWidth={2.25} />
                    )}
                  </View>
                  <Text style={styles.messageTitle}>{isInbound ? 'Received' : 'Sent'} · {message.status ?? 'UNKNOWN'}</Text>
                </View>
                <Text style={styles.body}>{message.subject ?? '(no subject)'}</Text>
                {message.bodyPreview ? <Text style={styles.description}>{message.bodyPreview}</Text> : null}
                <Text style={styles.timestamp}>{message.timestamp}</Text>
              </View>
            );
          })
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.display,
    fontSize: 22,
  },
  subject: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  meta: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewLabel: {
    ...typography.caption,
  },
  overviewValue: {
    ...typography.bodyStrong,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  messageCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  directionIcon: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
