import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScheduleEmailRequest } from '../../types/api';
import { cancelScheduledEmail, getScheduledEmails, scheduleEmail } from '../api/scheduledEmailsApi';

export function useScheduledEmails(ticketPublicId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['scheduled-emails', ticketPublicId],
    queryFn: () => getScheduledEmails(ticketPublicId as string),
    enabled: enabled && Boolean(ticketPublicId),
  });
}

export function useScheduleEmail(ticketPublicId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ScheduleEmailRequest) => scheduleEmail(ticketPublicId as string, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-emails', ticketPublicId] }),
  });
}

export function useCancelScheduledEmail(ticketPublicId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dispatchId: number) => cancelScheduledEmail(ticketPublicId as string, dispatchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-emails', ticketPublicId] }),
  });
}
