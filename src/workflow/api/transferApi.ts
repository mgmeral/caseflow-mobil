import { apiClient } from '../../core/api/apiClient';
import type { TransferResponse } from '../../types/api';

export interface TransferTicketInput {
  ticketId: string;
  fromGroupId: number;
  toGroupId: number;
  reason?: string;
  clearAssignee?: boolean;
}

export async function transferTicket(input: TransferTicketInput) {
  return apiClient.post<TransferResponse>('/transfers', {
    ticketId: Number(input.ticketId),
    fromGroupId: input.fromGroupId,
    toGroupId: input.toGroupId,
    reason: input.reason ?? null,
    clearAssignee: input.clearAssignee ?? true,
  });
}
