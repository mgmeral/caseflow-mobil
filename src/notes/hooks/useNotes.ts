import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addNote, getNotesByTicket } from '../api/notesApi';
import type { NoteType } from '../../types/api';

export function useNotes(ticketId: string) {
  return useQuery({
    queryKey: ['case-notes', ticketId],
    queryFn: () => getNotesByTicket(ticketId),
    enabled: Boolean(ticketId),
  });
}

export function useAddNote(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, type }: { content: string; type?: NoteType }) => addNote(ticketId, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-notes', ticketId] });
    },
  });
}
