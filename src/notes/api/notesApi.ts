import { apiClient } from '../../core/api/apiClient';
import type { NoteResponse, NoteType } from '../../types/api';

export async function getNotesByTicket(ticketId: string) {
  return apiClient.get<NoteResponse[]>(`/notes/by-ticket/${ticketId}`);
}

export async function addNote(ticketId: string, content: string, type: NoteType = 'INTERNAL') {
  return apiClient.post<NoteResponse>('/notes', {
    ticketId: Number(ticketId),
    content,
    type,
    mentionedUserIds: [],
  });
}
