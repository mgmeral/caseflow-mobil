import { apiClient } from '../../core/api/apiClient';
import type { EmailThreadItemResponse, ReplyEnqueuedResponse } from '../../types/api';

export async function getConversation(caseId: string) {
  return apiClient.get<EmailThreadItemResponse[]>(`/tickets/${caseId}/email/thread`);
}

export interface SendReplyInput {
  mailboxId: number;
  sourceEventId: number;
  subject: string;
  textBody: string;
}

export async function sendReply(caseId: string, input: SendReplyInput) {
  return apiClient.post<ReplyEnqueuedResponse>(`/tickets/${caseId}/email/reply`, {
    mailboxId: input.mailboxId,
    sourceEventId: input.sourceEventId,
    subject: input.subject,
    textBody: input.textBody,
    contentWasEdited: true,
  });
}
