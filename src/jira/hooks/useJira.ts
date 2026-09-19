import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createJiraLink, getJiraStatus, retryJiraLink } from '../api/jiraApi';

export function useJiraStatus(ticketPublicId: string | null) {
  return useQuery({
    queryKey: ['jira-status', ticketPublicId],
    queryFn: () => getJiraStatus(ticketPublicId as string),
    enabled: Boolean(ticketPublicId),
  });
}

export function useCreateJiraLink(ticketPublicId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createJiraLink(ticketPublicId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jira-status', ticketPublicId] }),
  });
}

export function useRetryJiraLink(ticketPublicId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => retryJiraLink(ticketPublicId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jira-status', ticketPublicId] }),
  });
}
