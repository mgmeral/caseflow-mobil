import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, ChevronRight, FileText, MessageSquare, Reply, RefreshCcw, UserCheck, UserMinus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCaseDetail } from '../hooks/useCaseDetail';
import { useCaseTransitions } from '../hooks/useCaseTransitions';
import { useConversation } from '../../conversations/hooks/useConversation';
import { useSendReply } from '../../conversations/hooks/useSendReply';
import { AttachmentsSection } from '../components/AttachmentsSection';
import { HistorySection } from '../components/HistorySection';
import { JiraSection } from '../components/JiraSection';
import { NotesSection } from '../components/NotesSection';
import { ReplyComposerSheet } from '../components/ReplyComposerSheet';
import { TagsSection } from '../components/TagsSection';
import { TransferSheet } from '../components/TransferSheet';
import { useGroups } from '../../groups/hooks/useGroups';
import { Avatar } from '../../shared/components/Avatar';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { getDisplayMessage } from '../../core/api/http';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { SelectSheet } from '../../shared/components/SelectSheet';
import { SlaBadge } from '../../shared/components/SlaBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { getStatusConfig } from '../../shared/theme/status';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { useAssignCase, useChangeCaseStatus, useTransferCase, useUnassignCase } from '../../workflow/hooks/useTicketWorkflow';
import { useSessionStore } from '../../core/auth/sessionStore';
import { hasPermission } from '../../shared/utils/permissions';

export function CaseDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const caseId = String(route.params?.caseId ?? '');
  const detailQuery = useCaseDetail(caseId);
  const conversationQuery = useConversation(caseId);

  const user = useSessionStore((state) => state.user);
  const permissions = user?.permissionCodes ?? [];
  const canChangeStatus = hasPermission(permissions, 'TICKET_STATUS_CHANGE');
  const canAssign = hasPermission(permissions, 'TICKET_ASSIGN');
  const canTransfer = hasPermission(permissions, 'TICKET_TRANSFER');
  const canAddNote = hasPermission(permissions, 'INTERNAL_NOTE_ADD');
  const canManageTags = hasPermission(permissions, 'TICKET_TAG');
  const canManageJira = hasPermission(permissions, 'CUSTOMER_REPLY_SEND') || hasPermission(permissions, 'INTEGRATION_CONFIG_MANAGE');
  const canReply = hasPermission(permissions, 'TICKET_EMAIL_REPLY_SEND');

  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [transferSheetOpen, setTransferSheetOpen] = useState(false);
  const [replySheetOpen, setReplySheetOpen] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const transitionsQuery = useCaseTransitions(caseId, statusSheetOpen && canChangeStatus);
  const groupsQuery = useGroups(transferSheetOpen && canTransfer);

  const changeStatus = useChangeCaseStatus(caseId);
  const assignCase = useAssignCase(caseId);
  const unassignCase = useUnassignCase(caseId);
  const transferCase = useTransferCase(caseId);
  const sendReply = useSendReply(caseId);

  if (detailQuery.isLoading) {
    return <CenteredState title="Loading case detail" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <CenteredState title="Could not load case detail" actionLabel="Retry" onAction={() => detailQuery.refetch()} />;
  }

  const detail = detailQuery.data;
  const messages = conversationQuery.data ?? [];
  const isAssignedToMe = user != null && detail.assignedUserId === user.id;
  const lastInbound = [...messages].reverse().find((message) => message.direction === 'INBOUND');
  const replyToAddress = lastInbound?.fromAddress ?? null;

  const statusOptions = (transitionsQuery.data?.allowedTransitions ?? []).map((status) => ({
    value: status,
    label: getStatusConfig(status).label,
  }));

  return (
    <Screen scrollable>
      <Pressable
        style={styles.headerRow}
        disabled={detail.customerId == null}
        onPress={() => detail.customerId != null && navigation.navigate('CustomersStack', { screen: 'CustomerDetail', params: { customerId: String(detail.customerId) } })}
      >
        <Avatar name={detail.customerName || detail.ticketNo} size={48} />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {detail.ticketNo}
          </Text>
          <Text style={styles.subject}>{detail.subject}</Text>
          <Text style={styles.meta}>{detail.customerName}</Text>
        </View>
        {detail.customerId != null ? <ChevronRight size={18} color={colors.mutedLight} /> : null}
      </Pressable>

      <View style={styles.badgeRow}>
        <PriorityBadge priority={detail.priority} size="md" />
        <StatusBadge status={detail.status} size="md" />
        <SlaBadge slaState={detail.slaState} size="md" />
      </View>

      {(canChangeStatus || canAssign || canTransfer) ? (
        <View style={styles.actionsRow}>
          {canChangeStatus ? (
            <Button
              label="Status"
              variant="secondary"
              size="sm"
              icon={<RefreshCcw size={14} color={colors.text} />}
              onPress={() => setStatusSheetOpen(true)}
              style={styles.actionButton}
            />
          ) : null}
          {canAssign ? (
            isAssignedToMe ? (
              <Button
                label="Unassign"
                variant="secondary"
                size="sm"
                icon={<UserMinus size={14} color={colors.text} />}
                onPress={() => unassignCase.mutate()}
                loading={unassignCase.isPending}
                style={styles.actionButton}
              />
            ) : (
              <Button
                label="Assign to me"
                variant="secondary"
                size="sm"
                icon={<UserCheck size={14} color={colors.text} />}
                onPress={() => user && assignCase.mutate(user.id)}
                loading={assignCase.isPending}
                style={styles.actionButton}
              />
            )
          ) : null}
          {canTransfer && detail.assignedGroupId != null ? (
            <Button
              label="Transfer"
              variant="secondary"
              size="sm"
              icon={<ArrowRightLeft size={14} color={colors.text} />}
              onPress={() => setTransferSheetOpen(true)}
              style={styles.actionButton}
            />
          ) : null}
        </View>
      ) : null}

      <SectionCard title="Case Overview" icon={FileText}>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Assigned</Text>
          <Text style={styles.overviewValue}>{detail.assignedUserName ?? 'Unassigned'}</Text>
        </View>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Group</Text>
          <Text style={styles.overviewValue}>{detail.assignedGroupName ?? 'None'}</Text>
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
        {canReply && lastInbound ? (
          <Button
            label="Reply"
            variant="secondary"
            size="sm"
            icon={<Reply size={14} color={colors.text} />}
            onPress={() => setReplySheetOpen(true)}
            style={styles.replyButton}
          />
        ) : null}
      </SectionCard>

      <TagsSection caseId={caseId} canManageTags={canManageTags} />

      <JiraSection ticketPublicId={detail.publicId} canManageJira={canManageJira} />

      <AttachmentsSection attachments={detail.attachments} />

      <NotesSection caseId={caseId} canAddNote={canAddNote} />

      <HistorySection history={detail.history} />

      <SelectSheet
        visible={statusSheetOpen}
        title="Change Status"
        options={statusOptions}
        selectedValue={detail.status}
        emptyLabel={transitionsQuery.isLoading ? 'Loading…' : 'No status changes available from here.'}
        onSelect={(status) => {
          changeStatus.mutate(status);
          setStatusSheetOpen(false);
        }}
        onClose={() => setStatusSheetOpen(false)}
      />

      <TransferSheet
        visible={transferSheetOpen}
        groups={groupsQuery.data ?? []}
        currentGroupId={detail.assignedGroupId}
        currentGroupName={detail.assignedGroupName}
        isSubmitting={transferCase.isPending}
        onConfirm={(toGroupId, reason) => {
          if (detail.assignedGroupId == null) return;
          transferCase.mutate(
            { fromGroupId: detail.assignedGroupId, toGroupId, reason },
            { onSuccess: () => setTransferSheetOpen(false) },
          );
        }}
        onClose={() => setTransferSheetOpen(false)}
      />

      <ReplyComposerSheet
        visible={replySheetOpen}
        defaultSubject={detail.subject.startsWith('Re:') ? detail.subject : `Re: ${detail.subject}`}
        toAddress={replyToAddress}
        isSending={sendReply.isPending}
        errorMessage={replyError}
        onSend={(subject, body) => {
          if (!lastInbound || lastInbound.mailboxId == null) {
            setReplyError('This message cannot be replied to — its mailbox reference is missing.');
            return;
          }
          const sourceEventId = lastInbound.sourceEventId ?? Number(lastInbound.id);
          setReplyError(null);
          sendReply.mutate(
            { mailboxId: lastInbound.mailboxId, sourceEventId, subject, textBody: body },
            {
              onSuccess: () => setReplySheetOpen(false),
              onError: (error) => setReplyError(getDisplayMessage(error)),
            },
          );
        }}
        onClose={() => {
          setReplySheetOpen(false);
          setReplyError(null);
        }}
      />
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  overviewLabel: {
    ...typography.caption,
  },
  overviewValue: {
    ...typography.bodyStrong,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
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
  replyButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
});
