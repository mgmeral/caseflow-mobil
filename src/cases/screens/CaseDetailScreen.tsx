import { useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { useCaseDetail } from '../hooks/useCaseDetail';
import { useConversation } from '../../conversations/hooks/useConversation';
import { CenteredState } from '../../shared/components/CenteredState';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';

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
      <Text style={styles.title}>{detail.ticketNo}</Text>
      <Text style={styles.subject}>{detail.subject}</Text>
      <Text style={styles.meta}>{detail.customerName}</Text>

      <SectionCard title="Case Overview">
        <Text style={styles.body}>Status: {detail.status}</Text>
        <Text style={styles.body}>Priority: {detail.priority}</Text>
        <Text style={styles.body}>Assigned: {detail.assignedUserName ?? 'Unassigned'}</Text>
        <Text style={styles.body}>SLA: {detail.slaState ?? 'N/A'}</Text>
        {detail.description ? <Text style={styles.description}>{detail.description}</Text> : null}
      </SectionCard>

      <SectionCard title="Conversation" subtitle="Current backend contract is email-backed.">
        {conversationQuery.isLoading ? (
          <Text style={styles.body}>Loading conversation…</Text>
        ) : messages.length === 0 ? (
          <Text style={styles.body}>No conversation items found.</Text>
        ) : (
          messages.map((message) => (
            <View key={`${message.direction}-${message.id}`} style={styles.messageCard}>
              <Text style={styles.messageTitle}>{message.direction} · {message.status ?? 'UNKNOWN'}</Text>
              <Text style={styles.body}>{message.subject ?? '(no subject)'}</Text>
              {message.bodyPreview ? <Text style={styles.description}>{message.bodyPreview}</Text> : null}
              <Text style={styles.timestamp}>{message.timestamp}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subject: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 16,
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
    marginTop: 6,
  },
  messageCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  messageTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
});
