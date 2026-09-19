import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTagToTicket, getActiveTags, getTicketTags, removeTagFromTicket } from '../api/tagsApi';

export function useActiveTags(enabled = true) {
  return useQuery({
    queryKey: ['tags-active'],
    queryFn: getActiveTags,
    enabled,
    staleTime: 60_000,
  });
}

export function useTicketTags(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-tags', ticketId],
    queryFn: () => getTicketTags(ticketId),
    enabled: Boolean(ticketId),
  });
}

export function useAddTicketTag(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: number) => addTagToTicket(ticketId, tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-tags', ticketId] }),
  });
}

export function useRemoveTicketTag(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: number) => removeTagFromTicket(ticketId, tagId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-tags', ticketId] }),
  });
}
