import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeCaseStatus } from '../../cases/api/casesApi';
import { assignTicket, unassignTicket } from '../api/assignmentApi';
import { transferTicket, type TransferTicketInput } from '../api/transferApi';

function useInvalidateTicketQueries(caseId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['case-detail', caseId] });
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    queryClient.invalidateQueries({ queryKey: ['inbox-queue'] });
    queryClient.invalidateQueries({ queryKey: ['inbox-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['case-transitions', caseId] });
  };
}

export function useChangeCaseStatus(caseId: string) {
  const invalidate = useInvalidateTicketQueries(caseId);
  return useMutation({
    mutationFn: (status: string) => changeCaseStatus(caseId, status),
    onSuccess: invalidate,
  });
}

export function useAssignCase(caseId: string) {
  const invalidate = useInvalidateTicketQueries(caseId);
  return useMutation({
    mutationFn: (assignedUserId: number) => assignTicket(caseId, assignedUserId),
    onSuccess: invalidate,
  });
}

export function useUnassignCase(caseId: string) {
  const invalidate = useInvalidateTicketQueries(caseId);
  return useMutation({
    mutationFn: () => unassignTicket(caseId),
    onSuccess: invalidate,
  });
}

export function useTransferCase(caseId: string) {
  const invalidate = useInvalidateTicketQueries(caseId);
  return useMutation({
    mutationFn: (input: Omit<TransferTicketInput, 'ticketId'>) => transferTicket({ ticketId: caseId, ...input }),
    onSuccess: invalidate,
  });
}
