import { ExternalLink, Link as LinkIcon } from 'lucide-react-native';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCreateJiraLink, useJiraStatus, useRetryJiraLink } from '../../jira/hooks/useJira';
import { Button } from '../../shared/components/Button';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

interface Props {
  ticketPublicId: string | null;
  canManageJira: boolean;
}

const FAILED_STATUSES = new Set(['FAILED', 'PERMANENTLY_FAILED']);
const IN_FLIGHT_STATUSES = new Set(['PENDING', 'PROCESSING']);

export function JiraSection({ ticketPublicId, canManageJira }: Props) {
  const statusQuery = useJiraStatus(ticketPublicId);
  const createLink = useCreateJiraLink(ticketPublicId);
  const retryLink = useRetryJiraLink(ticketPublicId);

  if (!ticketPublicId || statusQuery.isLoading) {
    return null;
  }

  const status = statusQuery.data;
  if (!status) {
    return null;
  }

  const isLinked = status.jobStatus === 'SUCCEEDED';
  const isFailed = FAILED_STATUSES.has(status.jobStatus);
  const isInFlight = IN_FLIGHT_STATUSES.has(status.jobStatus);
  const isNotRequested = status.jobStatus === 'NOT_REQUESTED';

  if (isNotRequested && !canManageJira) {
    return null;
  }

  return (
    <SectionCard title="Jira" icon={LinkIcon}>
      {isLinked ? (
        <Pressable onPress={() => status.jiraUrl && Linking.openURL(status.jiraUrl)} style={styles.linkedRow}>
          <Text style={styles.issueKey}>{status.jiraIssueKey}</Text>
          <ExternalLink size={14} color={colors.primary} />
        </Pressable>
      ) : isInFlight ? (
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.body}>Creating Jira issue… ({status.jobStatus.toLowerCase()})</Text>
        </View>
      ) : isFailed ? (
        <View>
          <Text style={styles.errorText}>{status.lastError ?? 'Jira link failed.'}</Text>
          {canManageJira ? (
            <Button label="Retry" variant="secondary" size="sm" onPress={() => retryLink.mutate()} loading={retryLink.isPending} style={styles.actionButton} />
          ) : null}
        </View>
      ) : (
        canManageJira ? (
          <Button label="Create Jira Issue" variant="secondary" size="sm" onPress={() => createLink.mutate()} loading={createLink.isPending} style={styles.actionButton} />
        ) : (
          <Text style={styles.body}>No Jira issue linked.</Text>
        )
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  issueKey: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  body: {
    ...typography.body,
  },
  errorText: {
    ...typography.body,
    color: colors.errorText,
    marginBottom: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
});
